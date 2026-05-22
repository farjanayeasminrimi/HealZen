import React from "react";

const Token = async () => {
  const getToken = async () => {
    const { data: session } = await authClient.token();
    return await session;
  };
  const sessionToken = await getToken();
  console.log(sessionToken);
  return sessionToken;
};

export default Token;
