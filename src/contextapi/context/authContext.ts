import { createContext, useContext } from "react";

export interface Props {
  user: User | null;
  initialized: boolean;
  isPending: boolean;
  signin: (email: string, password: string) => Promise<PromiseResult>;
  signout: () => Promise<PromiseResult>;
  signup: (newUser: User, password: string) => Promise<PromiseResult>;
  updateUser?: (target: keyof User, value: any) => Promise<PromiseResult>;
}

export const initialState: Props = {
  user: null,
  initialized: false,
  isPending: false,
  signin: async () => ({}),
  signout: async () => ({}),
  signup: async () => ({}),
  updateUser: async () => ({}),
};

export const context = createContext(initialState);

export const use = () => useContext(context);
