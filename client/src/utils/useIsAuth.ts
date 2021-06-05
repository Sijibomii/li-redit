import { useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useIsAuth = async  () => {
  const [{ data, fetching}] = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    if (!fetching && !data?.me) {
      console.log('yupp')
      // router.replace("/login?next=" + router.pathname);
    }
  }, [fetching, data, router]);
};
