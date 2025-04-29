"use client";
import { useActiveComponent } from "../(context)/ActiveComponentProvider";

const page = () => {
  const { activeComponent } = useActiveComponent();

  console.log(activeComponent, "7");
  


  return <>{activeComponent}</>;
};
export default page;

