import { object, string } from "zod";

const getPasswordSchema = (type: "password" | "confirmPassword") =>
    string()
        .nonempty(`${type} is required`)
        .min(8, `${type} must be atleast 8 characters`)
        .max(32, `${type} can not exceed 32 characters`);

const getEmailSchema = () =>
    string()
        .nonempty("Email is required")
        .min(1, "Email is required")
        .email("Invalid email");

const getNameSchema = () =>
    string()
        .nonempty("Name is required")
        .min(1, "Name is required")
        .max(50, "Name must be less than 50 characters");

export const signUpSchema = object({
    name: getNameSchema(),
    email: getEmailSchema(),
    password: getPasswordSchema("password"),
    confirmPassword: getPasswordSchema("confirmPassword"),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export const signInSchema = object({
    email: getEmailSchema(),
    password: getPasswordSchema("password"),
});

export const forgotPasswordSchema = object({
    email: getEmailSchema(),
});

export const resetPasswordSchema = object({
    password: getPasswordSchema("password"),
    confirmPassword: getPasswordSchema("confirmPassword"),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
});