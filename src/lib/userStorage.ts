export const getUserId = (): string => {
  let userId = localStorage.getItem('ml_user_id');
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('ml_user_id', userId);
  }
  
  return userId;
};
