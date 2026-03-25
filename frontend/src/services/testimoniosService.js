import axios from 'axios';

/**
 * Servicio para obtener datos desde JSONPlaceholder
 * y simular la red para los testimonios de la Landing.
 */
export const obtenerTestimonios_sm_vc = async (limite_sm_vc = 6) => {
  const response = await axios.get(`https://jsonplaceholder.typicode.com/todos?_limit=${limite_sm_vc}`);
  return response.data;
};
