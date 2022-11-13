import React from "react";

import { useService } from "../hooks";

export const Energy = () => {
  const [data] = useService<EnergyServiceData>("energy");

  return <div>{data && JSON.stringify(data)}</div>;
};
