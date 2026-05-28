import axios from "axios";
import axiosJwt from "./axiosJwt";

export const getAllProduct = async ({ page = 1, limit = 10, key = null, value = null, search = '', ...rest }) => {
  const params = { page, limit, search, ...rest };
  if (key && value) {
    params.key = key;
    params.value = value;
  }

  const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, { params });
  return res.data;
};

export const createProduct = async (data, access_token) => {
  try {
    const res = await axiosJwt.post(`${process.env.REACT_APP_API_URL}/products`, data, {
      headers: {
        token: `Bearer ${access_token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
    const errResponse = error?.response?.data;
    throw new Error(errResponse?.message || 'Lỗi tạo sản phẩm');
  }
};

export const getDetailProduct = async (id) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  return res.data;
};

export const updateProduct = async (id, access_token, data) => {
  try {
    const res = await axiosJwt.put(`${process.env.REACT_APP_API_URL}/products/${id}`, data, {
      headers: {
        token: `Bearer ${access_token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    return res.data;
  } catch (error) {
    const errResponse = error?.response?.data;
    throw new Error(errResponse?.message || 'Lỗi cập nhật sản phẩm');
  }
};

export const deleteProduct = async (id, access_token) => {
  const res = await axiosJwt.delete(`${process.env.REACT_APP_API_URL}/products/${id}`, {
    headers: {
      token: `Bearer ${access_token}`,
    }
  });
  return res.data;
};