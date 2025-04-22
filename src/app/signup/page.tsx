const page = () => {
  interface User {
    uid: string;
    email: string;
    password: string;
    name: string;
    tel: string;
    birth: string;
    agreeLocation: boolean;
  }
  return (
    <div className="rounded-2xl h-screen flex flex-col justify-center items-center px-4 min-h-screen ">
      <div className="border w-full border-teal-300 rounded-lg max-w-md bg-white divide-y">
        {/* 이름 */}
        <div className="flex items-center p-4 border-teal-300">
          <label htmlFor="" className="w-32 text-gray-700">
            이름
          </label>
          <input
            type="text"
            className="border-none focus:outline-none flex-1"
          />
        </div>
        {/* 이메일 */}
        <div className="flex items-center p-4 border-teal-300">
          <label htmlFor="" className="w-32 text-gray-700">
            이메일
          </label>
          <input
            type="text"
            className="border-none focus:outline-none flex-1"
          />
        </div>
        {/* 비밀번호 */}
        <div className="flex items-center p-4 border-teal-300">
          <label htmlFor="" className="w-32 text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            className="border-none focus:outline-none flex-1"
          />
        </div>
        {/* 생년월일 */}
        <div className="flex items-center p-4 border-teal-300">
          <label htmlFor="" className="w-32 text-gray-700">
            생년월일(8자리)
          </label>
          <input
            type="text"
            className="border-none focus:outline-none flex-1"
          />
        </div>
        {/* 전화번호 */}
        <div className="flex items-center p-4 border-teal-300">
          <label htmlFor="" className="w-32 text-gray-700">
            전화번호
          </label>
          <input
            type="text"
            className="border-none focus:outline-none flex-1"
          />
        </div>
        <div className="flex items-center p-4 border-teal-300">
          <label htmlFor="" className="w-32 text-gray-700">
            위치정보 검색
          </label>
          <input
            type="text"
            className="border-none focus:outline-none flex-1"
          />
        </div>
      </div>
      <button className="mt-10  bg-green-500 w-200">가입</button>
    </div>
  );
};

export default page;
