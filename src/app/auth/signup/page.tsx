const Signup = () => {
  return (
    <>
      <div className="border border-gray-200 rounded-lg w-full max-w-md mx-auto divide-y divide-gray-200">
        {/* 이름 */}
        <div className="flex items-center p-4">
          <label className="w-32 text-gray-700">이름</label>
          <input
            className="flex-1 border-none focus:outline-none"
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* 이메일 + 중복확인 버튼 */}
        <div className="flex items-center p-4">
          <label className="w-32 text-gray-700">이메일</label>
          <input
            className="flex-1 border-none focus:outline-none"
            placeholder="이메일을 입력하세요"
          />
          <button className="ml-2 px-2 py-1 text-sm rounded bg-[#C5E3DB] text-gray-700">
            중복확인
          </button>
        </div>

        {/* 비밀번호 */}
        <div className="flex items-center p-4">
          <label className="w-32 text-gray-700">비밀번호</label>
          <input
            className="flex-1 border-none focus:outline-none"
            type="password"
            placeholder="비밀번호 입력"
          />
        </div>

        {/* 생년월일 */}
        <div className="flex items-center p-4">
          <label className="w-32 text-gray-700">생년월일(8자리)</label>
          <input
            className="flex-1 border-none focus:outline-none"
            placeholder="예: 19980101"
          />
        </div>

        {/* 전화번호 */}
        <div className="flex items-center p-4">
          <label className="w-32 text-gray-700">전화번호</label>
          <input
            className="flex-1 border-none focus:outline-none"
            placeholder="010-0000-0000"
          />
        </div>
      </div>
    </>
  );
};

export default Signup;
