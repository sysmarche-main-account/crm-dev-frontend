"use client";
import { useActiveComponent } from "../(context)/ActiveComponentProvider";

const page = () => {
  const { activeComponent } = useActiveComponent();
  return <>{activeComponent}</>;
};

export default page;
