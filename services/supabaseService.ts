
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xmlsbkiahzmrtsautoqk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_K4w8RQ5BDWhRKyi_yBCptQ_Ky1ZXpDh';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- DAILY LOGS ---
export const saveDailyLog = async (userId: string, date: string, log: any) => {
    try {
        const { error } = await supabase
            .from('daily_logs')
            .upsert({ 
                user_id: userId, 
                date: date, 
                content: log 
            }, { onConflict: 'user_id,date' });
        if (error) throw error;
    } catch (err) {
        console.warn("Erro ao salvar log:", err);
    }
};

export const fetchDailyLogs = async (userId: string) => {
    const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId);
    
    if (error) return {};
    return data.reduce((acc: any, item: any) => {
        acc[item.date] = item.content;
        return acc;
    }, {});
};

// --- USER PROFILES ---
export const saveUserProfile = async (userId: string, profile: any) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, data: profile, updated_at: new Date().toISOString() });
        if (error) throw error;
    } catch (err) {
        console.error("Erro ao salvar perfil:", err);
    }
};

export const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', userId)
        .single();
    
    if (error || !data) return null;
    return data.data;
};

// --- COMMUNITY POSTS ---
export const savePostToSupabase = async (post: any) => {
    const { data, error } = await supabase
        .from('community_posts')
        .insert({
            author_id: post.author.uid,
            author_email: post.author.email,
            author_name: post.author.name,
            author_avatar: post.author.avatar,
            category: post.category,
            text_content: post.text,
            image_url: post.imageUrl,
            timestamp: post.timestamp,
            reactions: post.reactions
        })
        .select()
        .single();
    if (error) console.error("Erro ao postar:", error);
    return data;
};

export const updatePostReactions = async (postId: string, reactions: any) => {
    await supabase
        .from('community_posts')
        .update({ reactions })
        .eq('id', postId);
};

export const deletePostFromSupabase = async (postId: string) => {
    await supabase.from('community_posts').delete().eq('id', postId);
};

export const fetchCommunityPosts = async () => {
    const { data, error } = await supabase
        .from('community_posts')
        .select('*, comments:comments(*)')
        .order('timestamp', { ascending: false });
    
    if (error) return [];
    return data.map((p: any) => ({
        id: p.id,
        author: { uid: p.author_id, name: p.author_name, email: p.author_email, avatar: p.author_avatar },
        text: p.text_content,
        imageUrl: p.image_url,
        timestamp: p.timestamp,
        category: p.category,
        reactions: p.reactions,
        comments: p.comments.map((c: any) => ({
            id: c.id,
            author: { uid: c.author_id, name: c.author_name, email: '', avatar: c.author_avatar },
            text: c.text_content,
            timestamp: c.timestamp,
            reactions: c.reactions,
            replies: []
        }))
    }));
};

// --- COMMENTS ---
export const saveCommentToSupabase = async (postId: string, comment: any) => {
    const { error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            author_id: comment.author.uid,
            author_name: comment.author.name,
            author_avatar: comment.author.avatar,
            text_content: comment.text,
            timestamp: comment.timestamp,
            reactions: comment.reactions
        });
    if (error) console.error("Erro ao comentar:", error);
};

// --- NOTIFICATIONS ---
export const saveNotificationToSupabase = async (recipientId: string, notif: any) => {
    await supabase.from('notifications').insert({
        recipient_id: recipientId,
        from_user_name: notif.fromUser.name,
        from_user_avatar: notif.fromUser.avatar,
        type: notif.type,
        post_id: notif.postId,
        post_text_snippet: notif.postTextSnippet,
        timestamp: notif.timestamp
    });
};
