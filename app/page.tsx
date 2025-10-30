"use server";

import Link from "next/link";
import { getProfile } from "./actions/profileActions";
import { logoutAction } from "./actions/logoutActions";

export default async function Home() {
  const profile = await getProfile();

  return (
    <>
      {/* HEADER */}
      <div>
        <nav className="p-12 flex justify-between items-center">
          <div>
            <span>FIDBEKAMI</span>
          </div>
          <div>
            {profile ? (
              <>
                <span>Hello! {profile.first_name}</span>
                <form action={logoutAction}>
                  <button type="submit">Logout</button>
                </form>
              </>
            ) : (
              <>
                {" "}
                <Link href={"/auth/register"}>
                  <span className="mr-6">Sign Up</span>
                </Link>
                <Link href={"/auth/login"}>
                  <span>Log in</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
