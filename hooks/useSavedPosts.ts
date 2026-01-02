
import { UserProfile } from '../types';

export const useSavedPosts = (userProfile: UserProfile, onUpdateProfile: (data: Partial<UserProfile>) => void) => {
  const savedIds = userProfile.savedPosts || [];

  const toggleSave = (postId: string) => {
    const isSaved = savedIds.includes(postId);
    const newSaved = isSaved 
      ? savedIds.filter(id => id !== postId)
      : [...savedIds, postId];
    
    onUpdateProfile({ savedPosts: newSaved });
  };

  const isSaved = (postId: string) => savedIds.includes(postId);

  return { savedIds, toggleSave, isSaved };
};
