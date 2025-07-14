// src/services/sesameService.js

import { API_URL } from "../utils/config";

export const getDiasSesame = async (employeeId, from, to) => {
  const params = new URLSearchParams({
    employeeIds: employeeId,
    from,
    to,
  });

  const url = `${API_URL}/sesame/worked-absence-days?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Error al consultar días trabajados");
  }

  const data = await res.json();
  console.log("RESPUESTA BRUTA DE /sesame:", data);

  return data.data[0]?.days || [];
};
