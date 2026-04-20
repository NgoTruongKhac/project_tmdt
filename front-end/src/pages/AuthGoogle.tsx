import { useEffect } from "react";
import { useSearchParams } from "react-router";
import Cookies from "js-cookie";

export default function AuthGoogle() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    try {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      console.log(accessToken);

      Cookies.set("access_token", accessToken!);
      Cookies.set("refresh_token", refreshToken!);

      window.location.replace("/");
    } catch (error) {
      console.log(error);
    }
  });

  return <div>AuthGoogle</div>;
}
