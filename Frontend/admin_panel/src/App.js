import './App.css';
import { useForm } from "react-hook-form";
import React from "react";

function App() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => console.log(data);

    return (
    <>
      <p className="title">Registration Form</p>

      <form className="App" onSubmit={handleSubmit(onSubmit)}>
        <input type="text" {...register("username")}/>
          <input type="email" {...register("email", { required: true })} />
          {errors.email && <span style={{ color: "red" }}>
              *Email* is mandatory </span>}
          <input type="password" {...register("password")} />
          <input type={"submit"} value="Login"
          style={{ backgroundColor: "#a1eafb"}}/>
      </form>
    </>
  );
}

export default App;
