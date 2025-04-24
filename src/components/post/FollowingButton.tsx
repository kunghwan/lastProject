import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { useRouter } from "next/navigation";
import React, { useCallback, useTransition } from "react";





const FollowingButton = () => {
    const {user} = AUTH.use()
    const navi = useRouter()
    const [isPening,startTransition] = useTransition()

   

    const onFollow = useCallback(() => {
        if(!user){
            alert("로그인 후 이용해주세요")
            return navi.push('/signin')
        }
        startTransition(
           async ()=>{
            const ref = dbService.collection(FBCollection.USERS).doc(user.uid).collection("notification")
            const snap = await ref.add({
                follwingId: , // 팔로우한 사람의 ID
                followerId: null,// 팔로우된 사람의 ID
                createdAt:new Date().toLocaleString(),
                isRead: false,
         
           })}
        )
    
      
    },[])
  return (
    <div>
      <button>팔로우</button>
    </div>
  );
};

export default FollowingButton;
