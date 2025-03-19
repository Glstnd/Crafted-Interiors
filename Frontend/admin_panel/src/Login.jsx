import React from "react";
import { useForm } from "react-hook-form";
import "./App.css";

function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
      const userData = JSON.parse(localStorage.getItem(data.email));
      if (userData) {
          if (userData.password === data.password) {
              console.log(userData.name + " you are successfully logged in");
          } else {
              console.log("Email or Password is not matching with our record")
          }
      } else {
          console.log("Email or password is not matching with our record")
      }
    };

    return (
        <>
            <p className="title">Login form</p>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input type="email" {...register("email", { required: true})} />
                {errors.email && <span style={{ color: "red" }}>
                    *Email* is mandatory
                </span>}
                <input type="password" {...register("password")} />
                <input type={"submit"} style={{ backgroundColor: "#a1eafb" }}/>
            </form>
        </>
    );
}

export default Login;