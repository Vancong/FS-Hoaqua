import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutationHook } from "../../hooks/useMutationHook";
import * as ProductService from '../../services/Product.Services';
import TableComponents from '../TableComponents/TableComponents';
import LoadingComponent from "../LoadingComponent/LoadingComponent";
import { alertSuccess, alertConfirm, alertError } from '../../utils/alert';
import "./AdminProduct.scss";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import { useSelector } from 'react-redux';
import ProductFormComponent from "../FormAdmin/ProductFormComponent/ProductFormComponent";
import ButtonInputSearch from "../ButtonInputSearch/ButtonInputSearch";
import { getProductTableColumns } from "./ProductTableColumns";

const AdminProduct = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [rowSelected, setRowSelected] = useState('');
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [productData, setProductData] = useState(null);
  const [fileListCreate, setFileListCreate] = useState([]);
  const [fileListUpdate, setFileListUpdate] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  const [inputSearch, setInputSearch] = useState('');
  const [searchText, setSearchText] = useState('');

  const onChangeSearch = (e) => {
    setInputSearch(e.target.value);
  };

  const onSearch = () => {
    setCurrentPage(1);
    setSearchText(inputSearch);
  };

  const user = useSelector(state => state?.user);
  const queryClient = useQueryClient();
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const handleCancel = () => {
    setIsModalOpen(false);
    formCreate.resetFields();
    setFileListCreate([]);
  };

  const { isLoading: isLoadingProducts, data: products } = useQuery({
    queryKey: ['products', currentPage, searchText],
    queryFn: () => ProductService.getAllProduct({
      page: currentPage,
      limit,
      search: searchText
    }),
    keepPreviousData: true
  });

  const handleDetailProduct = async (record) => {
    setRowSelected(record?._id);
    try {
      const res = await ProductService.getDetailProduct(record?._id);
      if (res?.data) {
        const product = res.data;
        setProductData(product);
        formUpdate.setFieldsValue({
          name: product.name,
          price: product.price,
          stock: product.stock,
          sold: product.sold,
          discount: product.discount || 0,
          isFeatured: product.isFeatured,
          description: product.description,
          type: product.type || 'nội địa',
        });

        if (product.image) {
          setFileListUpdate([
            {
              uid: product._id,
              name: 'image.png',
              status: 'done',
              url: product.image,
            }
          ]);
        } else {
          setFileListUpdate([]);
        }

        setIsOpenDrawer(true);
      }
    } catch (error) {
      alertError('Lỗi', 'Không thể tải chi tiết sản phẩm');
    }
  };

  const handleDeleteProduct = async (record) => {
    const confirm = await alertConfirm('Xác nhận xoá', `Bạn có chắc muốn xoá sản phẩm "${record.name}"?`);
    if (!confirm) return;

    deleteProductMutation.mutate({ id: record._id, access_token: user?.access_token });
  };

  const columns = getProductTableColumns({
    onDetail: handleDetailProduct,
    onDelete: handleDeleteProduct
  });

  const deleteProductMutation = useMutationHook(async ({ id, access_token }) => {
    return await ProductService.deleteProduct(id, access_token);
  });

  const { data: dataDelete, isPending: isPendingDelete, isSuccess: isSuccessDelete, isError: isErrorDelete } = deleteProductMutation;
  
  useEffect(() => {
    if (isSuccessDelete && dataDelete?.status === 'OK') {
      alertSuccess('Thành công', 'Xoá sản phẩm thành công!');
      queryClient.invalidateQueries(['products']);
    }
    if (isErrorDelete) {
      alertError('Thất bại', dataDelete?.message || 'Đã có lỗi xảy ra khi xoá.');
    }
  }, [isSuccessDelete, isErrorDelete]);

  const dataTable = (products?.data || []).map(product => ({
    ...product,
    key: product._id
  }));

  const mutationCreate = useMutationHook(async ({ data, access_token }) => {
    return await ProductService.createProduct(data, access_token);
  });

  const { data: dataCreate, isSuccess: isSuccessCreate, isError: isErrorCreate, 
        isPending: isPendingCreate, error: errorCreate } = mutationCreate;

  useEffect(() => {
    if (isSuccessCreate && dataCreate?.status === 'OK') {
      handleCancel();
      alertSuccess("Thành công", "Tạo sản phẩm thành công");
      queryClient.invalidateQueries(['products']);
    }
    if (isErrorCreate) {
      alertError("Thất bại", errorCreate?.message);
    }
  }, [isSuccessCreate, isErrorCreate]);

  const mutationUpdate = useMutationHook(async ({ id, access_token, data }) => {
    return await ProductService.updateProduct(id, access_token, data);
  });

  const {
      data: dataUpdate,
      isSuccess: isSuccessUpdate,
      isError: isErrorUpdate,
      isPending: isPendingUpdate,
      error: errorUpdate
  } = mutationUpdate;

  useEffect(() => {
    if (isSuccessUpdate && dataUpdate?.status === 'OK') {
      handleCancel();
      alertSuccess("Thành công", "Cập nhật sản phẩm thành công");
      queryClient.invalidateQueries(['products']);
      setIsOpenDrawer(false);
    }
    if (isErrorUpdate) {
      alertError("Thất bại", errorUpdate?.message);
    }
  }, [isSuccessUpdate, isErrorUpdate]);

  const convertFormData = (values, fileList, isUpdate = false) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('price', values.price);
    formData.append('stock', values.stock);
    formData.append('discount', values.discount || 0);
    formData.append('description', values.description || '');
    formData.append('isFeatured', values.isFeatured === true);
    formData.append('type', values.type || 'nội địa');

    // Append single image file
    const file = fileList[0];
    if (file && file.originFileObj) {
      formData.append('image', file.originFileObj);
    } else if (file && file.url) {
      formData.append('image', file.url);
    }

    return formData;
  };

  const onCreateProduct = (values) => {
    if (fileListCreate.length === 0) {
      setIsFormSubmit(true);
      return;
    }
    setIsFormSubmit(false);
    const formData = convertFormData(values, fileListCreate);
    mutationCreate.mutate({ data: formData, access_token: user?.access_token });
  };

  const onUpdateProduct = (values) => {
    if (fileListUpdate.length === 0) {
      setIsFormSubmit(true);
      return;
    }
    setIsFormSubmit(false);
    const formData = convertFormData(values, fileListUpdate, true);
    mutationUpdate.mutate({ id: rowSelected, access_token: user?.access_token, data: formData });
  };

  return (
    <div className='admin_product'>
      <h1 className='title'>Quản lý sản phẩm</h1>
      <Button type="primary" className='btn_add' onClick={() => setIsModalOpen(true)}>
        <PlusOutlined /> Thêm sản phẩm
      </Button>
  
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <ButtonInputSearch 
          size="middle" 
          placeholder="Tìm kiếm sản phẩm..." 
          textButton="Tìm" 
          bgrColorInput="#fff"
          bgrColorButton="#1890ff"
          textColorButton="#fff"
          onChangeSearch={onChangeSearch}    
          onClickSearch={onSearch}            
          value={inputSearch}      
        />
      </div>

      <Modal
        title="Tạo sản phẩm"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <LoadingComponent isPending={isPendingCreate}>
          <ProductFormComponent
            form={formCreate}
            onFinish={onCreateProduct}
            fileList={fileListCreate}
            setFileList={setFileListCreate}
            isFormSubmit={isFormSubmit}
            isLoading={isPendingCreate}
            mode='create'
          />
        </LoadingComponent>
      </Modal>

      <TableComponents 
        data={dataTable} 
        columns={columns} 
        isLoading={isLoadingProducts}
        type="adminOrder" // Sets type to adminOrder to hide the row checkboxes since backend doesn't support delete-many for product
        pagination={{
          current: currentPage,
          pageSize: limit,
          total: products?.total || 1,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
      />

      <DrawerComponent  
        title='Chi tiết sản phẩm' 
        isOpen={isOpenDrawer} 
        onClose={() => setIsOpenDrawer(false)}
        width="83.5%"
      >
        <LoadingComponent isPending={isPendingUpdate}>
          <ProductFormComponent
            form={formUpdate}
            fileList={fileListUpdate}
            setFileList={setFileListUpdate}
            onFinish={onUpdateProduct}
            isLoading={isPendingUpdate}
            isFormSubmit={isFormSubmit}
            mode="update"
            initialValues={productData} 
          />
        </LoadingComponent>
      </DrawerComponent>
    </div>
  );
};

export default AdminProduct;
