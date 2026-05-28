import axios from "axios";
import axiosJwt from "./axiosJwt";

export const getConfig = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/payment/config`);
    return res.data;
};

export const createVnpayUrl = async (userId, access_token, orderCode) => {
    const res = await axiosJwt.post(
        `${process.env.REACT_APP_API_URL}/payment/vnpay/create-url/${userId}`,
        { orderCode },
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};
