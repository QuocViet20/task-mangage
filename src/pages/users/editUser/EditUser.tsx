import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import _ from "lodash";

//components
import Loading from "../../../components/elements/loading/Loading";
import EditUserFormComponent from "../../../components/elements/editUserForm/EditUserForm";

//types
import { EditUserForm, INewUser } from "../../../types";
import { DEFAULT_EDITUSER_DATA, SUBMIT_BUTTON_LABEL, SUBMITTING_BUTTON_LABEL } from "./consts";

// api
import { getUserId, updateUser } from "../../../api/serviceApi";


const EditUserPage = () => {
  const { userId } = useParams();
  console.log(userId)
  const {
    data: userResponse,
    isLoading: isGetUserLoading,
    isError: isGetUserError,
  } = useQuery({
    queryKey: ["getUser"],
    queryFn: () => getUserId(userId as string),
    enabled: !_.isNil(userId)
  })

  const defaultValues = useMemo(() => {
    if (_.isNil(userResponse)) {
      return DEFAULT_EDITUSER_DATA
    }
    const { email, username, role } = userResponse.data;
    return { email, username, role }
  }, [userResponse]);

  const user = useMemo(() => {
    if (_.isNil(userResponse)) {
      return DEFAULT_EDITUSER_DATA
    }
    const { email, username, role, password, accessToken } = userResponse.data;
    return { email, username, role, password, accessToken }
  }, [userResponse])

  const editUserMutation = useMutation({
    mutationFn: (body: INewUser) => {
      return updateUser(userId as string, body)
    },
    onError: () => {
      toast.error("Edit User failed", {
        position: toast.POSITION.TOP_RIGHT,
      });
    },
    onSuccess: () => {
      toast.success("Edit User successfully", {
        position: toast.POSITION.TOP_RIGHT,
      });
    },
  })

  const onSubmit = (data: EditUserForm) => {
    const updatedUser: INewUser = {
      email: data.email,
      username: data.username,
      role: data.role,
      password: user.password,
      accessToken: user.accessToken,
    }
    editUserMutation.mutate(updatedUser);

  }

  if (isGetUserError)
    return <h1 className="container text-danger text-center mt-4">Not found data</h1>

  if (isGetUserLoading) {
    return <Loading />
  }

  return (
    <EditUserFormComponent
      defaultValues={defaultValues}
      submitButtonLabel={SUBMIT_BUTTON_LABEL}
      submittingButtonLabel={SUBMITTING_BUTTON_LABEL}
      isSubmitting={editUserMutation.isLoading}
      onSubmit={onSubmit}
    />
  )
}

export default EditUserPage