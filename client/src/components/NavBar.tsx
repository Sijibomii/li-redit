import { useEffect } from "react";
import { Box, Link,Flex, Heading, Button } from '@chakra-ui/core';
import React from 'react'
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation  } from "../generated/graphql";
import { useRouter } from "next/router";
import { useIsAuth } from "../utils/useIsAuth";
//import { useApolloClient } from "@apollo/client";

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching}] = useMeQuery();
  const router = useRouter();
  const [{ fetching: logoutFetching },logout] = useLogoutMutation();
  
  let body=null;
   
   if (fetching) {
     // data is loading
    
  } else if (!data?.me && !fetching) {
    // user not logged in
    
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    );
   
  } else {
     // user is logged in
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            //await apolloClient.resetStore();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }

    return (
      <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
    );
}