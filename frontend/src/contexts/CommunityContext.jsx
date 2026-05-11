import { createContext, useContext, useState } from 'react'

const CommunityContext = createContext(null)

export function CommunityProvider({ children }) {
  const [userPosts, setUserPosts] = useState([])

  const addPost = (post) => setUserPosts(prev => [post, ...prev])
  const deletePost = (id) => setUserPosts(prev => prev.filter(p => p.id !== id))

  return (
    <CommunityContext.Provider value={{ userPosts, addPost, deletePost }}>
      {children}
    </CommunityContext.Provider>
  )
}

export function useCommunity() {
  const ctx = useContext(CommunityContext)
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider')
  return ctx
}
