import { Role, Status } from "./enum";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface INewUser {
  username: string;
  email: string;
  password: string;
  accessToken: string;
  role: Role;
}

export interface IUserFormRegister {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IFormUserCreateAccount {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

export interface IUserFormLogin {
  email: string;
  password: string;
}

export interface AuthData {
  username: string;
  email: string;
  accessToken: string;
  role: Role;
  userId: number;
}

export interface ITaskFormData {
  startTime: string;
  endTime: string;
  assignee: string;
  progress: string;
  title: string;
  status: Status;
}

export interface Task {
  id: number | undefined;
  startTime: string;
  endTime: string;
  assignee: string;
  progress: string;
  title: string;
  status: Status;
}

export interface Assignee {
  id: number | undefined;
  name: string;
  value: string;
}

export interface Option {
  label: string;
  value: any;
}
export interface EditUserForm {
  email: string;
  username: string;
  role: Role;
}
export interface ResetPasswordForm {
  password: string;
  newPassword: string;
  confirmPassword: string;
}
