import Input from "./components/Input";

export const App = () => {
  return (
    <div className="flex items-center justify-center h-screen mx-4 text-4xl">
      <div className="leading-normal">
        <span className="inline-block border-solid border-b-2 border-blue-900 leading-tight">
          <Input />
        </span>
      </div>
    </div>
  );
};
