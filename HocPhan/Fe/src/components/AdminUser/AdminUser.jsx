import React, { useEffect, useState } from 'react';
import "./AdminUser.scss"
import { Button, Form, Modal, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import TableComponents from '../TableComponents/TableComponents';
import UserFormComponent from "../FormAdmin/UserFormComponent/UserFormComponent"
import * as UserService from "../../services/User.Service" 
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { useMutationHook } from '../../hooks/useMutationHook';
import { updateUser } from '../../redux/slices/UserSlice';
import { jwtDecode } from 'jwt-decode';
import { alertConfirm, alertError, alertSuccess } from '../../utils/alert';
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import ButtonInputSearch from '../ButtonInputSearch/ButtonInputSearch';

const AdminUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowSelected, setRowSelected] = useState('');
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 8;
  const [inputSearch, setInputSearch] = useState('');
  const [searchText, setSearchText] = useState('');

  const onChangeSearch = (e) => {
    setInputSearch(e.target.value);
  };

  const onSearch = () => {
    setCurrentPage(1);
    setSearchText(inputSearch);
  };

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      render: text => <a>{text || 'Chưa cập nhật'}</a>,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || '')
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      render: text => text || '-'
    },
    {
      title: 'Quyền Admin',
      dataIndex: "isAdmin",
      render: (isAdmin) => (
        <Tag color={isAdmin ? 'gold' : 'blue'}>
          {isAdmin ? 'Có' : 'Không'}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'volcano'}>
          {isActive ? 'Hoạt động' : 'Dừng hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      render: (_, record) => renderAction(_, record)  
    },
  ];

  const deleteUserMutation = useMutationHook(async ({ id, access_token }) => {
    return UserService.deleteUser(id, access_token);
  })

  const handleDeleteUser = async (record) => {
    const confirm = await alertConfirm('Xác nhận xoá', `Bạn có chắc muốn xoá người dùng "${record.name || record.email}"?`);
    if (!confirm) return;
    deleteUserMutation.mutate({ id: record._id, access_token: user?.access_token });
  }

  const { isSuccess: isSuccessDelete, isError: isErrorDelete, data: dataDelete } = deleteUserMutation;

  useEffect(() => {
    if (isSuccessDelete && dataDelete?.status === 'OK') {
      alertSuccess('Thành công', 'Xoá người dùng thành công!');
      queryClient.invalidateQueries(['users']); 
    }
    if (isErrorDelete) {
      alertError('Thất bại', dataDelete?.message || 'Đã có lỗi xảy ra khi xoá.');
    }
  }, [isErrorDelete, isSuccessDelete, dataDelete])

  const mutationDeleteManyUser = useMutationHook(async ({ ids, access_token }) => {
    return await UserService.deleteManyUser(ids, access_token)
  });

  const handleDeleteManyUser = async (ids) => {
    const confirm = await alertConfirm('Xác nhận xoá', `Bạn có chắc muốn xoá những người dùng này?`);
    if (!confirm) return;
    mutationDeleteManyUser.mutate({ ids, access_token: user?.access_token })
  }
  
  const { data: dataDeleteMany, isSuccess: isSuccessDeleteMany, isError: isErrorDeleteMany } = mutationDeleteManyUser;
  
  useEffect(() => {
    if (isSuccessDeleteMany && dataDeleteMany?.status === 'OK') {
      alertSuccess('Thành công', 'Xoá người dùng thành công!');
      queryClient.invalidateQueries(['users']); 
    }
    if (isErrorDeleteMany) {
      alertError('Thất bại', dataDeleteMany?.message || 'Đã có lỗi xảy ra khi xoá.');
    }
  }, [isSuccessDeleteMany, isErrorDeleteMany]);

  const handleDetailUser = async (record) => {
    setRowSelected(record?._id);
    try {
      const res = await UserService.getDetailUser(record?._id, user?.access_token);
      if (res?.data) {
        const userData = res.data;
        formUpdate.setFieldsValue({
          name: userData.name,
          email: userData.email,
          password: "",
          phone: userData.phone,
          address: userData.address,
          isAdmin: userData.isAdmin,
          isActive: userData.isActive,
        });
        setIsOpenDrawer(true);
      }
    } catch (error) {
      alertError('Lỗi', 'Không thể tải chi tiết người dùng');
    }
  }

  const renderAction = (_, record) => {
    return (
      <div style={{ fontSize: '20px' }}>
        <EditOutlined 
          style={{ color: 'orange', cursor: 'pointer', marginRight: '10px' }}
          onClick={() => { handleDetailUser(record) }}
        />
        <DeleteOutlined 
          style={{ color: 'red', cursor: 'pointer' }} 
          onClick={() => handleDeleteUser(record)}  
        />
      </div>
    )
  }

  const onCancel = () => {
    setIsModalOpen(false);
    formCreate.resetFields();
  }

  const mutationCreate = useMutationHook(async (data) => {
    return await UserService.signUpUser(data);
  })

  const { data: dataCreate, isError: isErrorCreate, error: ErrorCreate, isSuccess: isSuccessCreate, isPending: isPendingCreate } = mutationCreate;
  
  useEffect(() => {
    if (isSuccessCreate && dataCreate?.status === 'OK') {
      alertSuccess("Thành Công", "Thêm người dùng thành công")
      queryClient.invalidateQueries(['users']);
      setIsModalOpen(false);
      formCreate.resetFields();
    } else if (isErrorCreate) {
      alertError("Thất bại", ErrorCreate?.message)
    }
  }, [isErrorCreate, isSuccessCreate, dataCreate])

  const onCreateUser = (values) => {
    mutationCreate.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
      confirmPassword: values.password,
      phone: values.phone ? Number(values.phone) : undefined,
      address: values.address
    });
  }

  const mutationUpdate = useMutationHook(async (data) => {
    return await UserService.updateUser(data.id, data.dataUpdate, data.access_token);
  });

  const { data: dataUpdate, isError: isErrorUpdate, error: errorUpdate, isSuccess: isSuccessUpdate, isPending: isPendingUpdate } = mutationUpdate;

  useEffect(() => {
    if (isSuccessUpdate && dataUpdate?.status === 'OK') {
      alertSuccess("Thành Công", "Cập nhật người dùng thành công");
      queryClient.invalidateQueries(['users']);
      setIsOpenDrawer(false);
      
      // Nếu user được cập nhật là chính user đang đăng nhập, tự động refresh token
      if (rowSelected === user?.id) {
        handleRefreshTokenForCurrentUser();
      }
    } else if (isErrorUpdate) {
      alertError("Thất bại", errorUpdate?.message);
    }
  }, [dataUpdate, isErrorUpdate, isSuccessUpdate, rowSelected, user?.id]);
  
  const handleRefreshTokenForCurrentUser = async () => {
    try {
      const refreshResponse = await UserService.refreshToken();
      if (refreshResponse?.status === 'OK' && refreshResponse?.access_token) {
        localStorage.setItem('access_token', refreshResponse.access_token);
        const decode = jwtDecode(refreshResponse.access_token);
        if (decode?.id) {
          const userDetail = await UserService.getDetailUser(decode.id, refreshResponse.access_token);
          if (userDetail?.data) {
            dispatch(updateUser({
              access_token: refreshResponse.access_token,
              ...userDetail.data
            }));
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi refresh token:', error);
    }
  };

  const onUpdataUser = async (values) => {
    const dataUpdate = {
      name: values.name,
      email: values.email,
      phone: values.phone ? Number(values.phone) : undefined,
      address: values.address,
      isAdmin: values.isAdmin,
      isActive: values.isActive,
    }

    if (values.password && values.password.trim() !== '') {
      dataUpdate.password = values.password;
    }

    if (rowSelected === user?.id) {
      try {
        console.log('Đang refresh token trước khi update chính mình...');
        const refreshResponse = await UserService.refreshToken();
        if (refreshResponse?.status === 'OK' && refreshResponse?.access_token) {
          const tokenToSave = refreshResponse.access_token;
          localStorage.setItem('access_token', tokenToSave);
          const decode = jwtDecode(refreshResponse.access_token);
          if (decode?.id) {
            const userDetail = await UserService.getDetailUser(decode.id, refreshResponse.access_token);
            if (userDetail?.data) {
              dispatch(updateUser({
                access_token: refreshResponse.access_token,
                ...userDetail.data
              }));
            }
          }
        }
      } catch (error) {
        console.error('Lỗi khi refresh token trước khi update:', error);
      }
    }

    mutationUpdate.mutate({
      id: rowSelected,
      dataUpdate,
      access_token: user?.access_token
    });
  }

  const { isLoading: isLoadingUsers, data: users } = useQuery({
    queryKey: ['users', currentPage, searchText],
    queryFn: () => UserService.getAlllUser(currentPage, limit, searchText, user.access_token),
    keepPreviousData: true,
    enabled: !!user.access_token
  });

  const dataTable = (users?.data || []).map(user => ({ ...user, key: user._id }))
  
  return (
    <div className='admin_user'>
      <h1 className='title'>Quản lý người dùng</h1>
      <Button type="primary" className='btn_add' onClick={() => setIsModalOpen(true)}>
        <PlusOutlined /> Thêm người dùng
      </Button>

      <ButtonInputSearch 
        size="middle" 
        placeholder="Nhập email hoặc tên người dùng.." 
        textButton="Tìm" 
        bgrColorInput="#fff"
        bgrColorButton="#1890ff"
        textColorButton="#fff"
        onChangeSearch={onChangeSearch}    
        onClickSearch={onSearch}            
        value={inputSearch}      
      />

      <div style={{ marginTop: '25px' }}>
        <Modal 
          title="Thêm người dùng"
          footer={null}
          open={isModalOpen}
          onCancel={onCancel}
        >
          <UserFormComponent
            form={formCreate}
            onFinish={onCreateUser}
            isLoading={isPendingCreate}
          />
        </Modal>
        <LoadingComponent isPending={isPendingUpdate} >
          <DrawerComponent 
            title='Chi tiết người dùng' 
            isOpen={isOpenDrawer} 
            onClose={() => setIsOpenDrawer(false)}
            width="83.5%" 
          >
            <UserFormComponent
              form={formUpdate}
              onFinish={onUpdataUser}
              isLoading={isPendingUpdate}
              mode='update'
            />
          </DrawerComponent>
        </LoadingComponent>
        <TableComponents 
          data={dataTable} 
          columns={columns}
          handleDeleteMany={handleDeleteManyUser}
          pagination={{
            current: currentPage,
            pageSize: limit,
            total: users?.total || 1,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
          }}
          isLoading={isLoadingUsers} 
        />
      </div>
    </div>
  );
};

export default AdminUser;