import {MoonLoader} from "react-spinners";

export const Spinner = ({ size = 20, color = "#ffffff" }) => {
  return (
    <MoonLoader
      color={color}
      loading
      size={size}
      speedMultiplier={0.8}
    />
  );
};