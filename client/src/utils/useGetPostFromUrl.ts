import { utimes } from "fs";
import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
  const intId = useGetIntId();
  console.log(intId)
  return usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
