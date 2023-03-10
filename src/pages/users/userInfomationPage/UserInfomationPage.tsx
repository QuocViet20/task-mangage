
import { useMutation, useQuery } from "@tanstack/react-query"
import { memo, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import _ from "lodash"
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";

//components
import Loading from "../../../components/elements/loading/Loading";
import PaginationComponent from "../../../components/elements/panigation/Pagination";

//types
import { RECORDS_PER_PAGE, STATUS_DATA } from "../../../consts";

//api
import { getTaskAssignee, getUserId, deleteTask } from "../../../api/serviceApi";

// hooks
import useDebounce from "../../../hooks/useSearch";
import TaskListComponent from "../../../components/elements/taskListComponent/TaskListComponent";


const UserInformation = memo(() => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState(STATUS_DATA[0].value)
  const debouncedSearchHook = useDebounce(searchValue, 1000);

  const currentPage = Number(searchParams.get("page")) || 1;

  const queryParams = status
    ? {
      currentPage,
      limit: RECORDS_PER_PAGE,
      searchText: debouncedSearchHook,
      status,
      assignee: userId as string
    }
    : {
      currentPage,
      limit: RECORDS_PER_PAGE,
      searchText: debouncedSearchHook,
      assignee: userId as string
    }

  const { data, isLoading, refetch }: any = useQuery({
    queryKey: [
      "tasks",
      queryParams.currentPage,
      queryParams.searchText,
      queryParams.status,
      queryParams.assignee
    ],
    queryFn: () => getTaskAssignee(queryParams)
  })

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryFn: () => getUserId(userId as string),
    enabled: !_.isNil(userId)
  })

  const totalPages = useMemo(() => {
    if (_.isNil(data) || _.isNil(data.headers["x-total-count"])) {
      return 0
    };
    return Math.ceil(
      parseInt(data.headers["x-total-count"]) / RECORDS_PER_PAGE
    )
  }, [data])

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      toast.success("Delete task success", {
        position: toast.POSITION.TOP_RIGHT
      });
      refetch();
    }
  })
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  const onPageChange = (pageNumber: number) => {
    navigate(`/users/${userId}?assignee=${userId}&page=${pageNumber}`)
  }

  if (isLoading) {
    return <Loading />
  }

  if (isUserLoading) {
    return <Loading />
  }
  if (isUserError) {
    return (
      <div className="container text-center mt-4">
        <h2 className="text-danger">Not found user</h2>
      </div>
    )
  }
  return (
    <div className="container mt-4">
      <div className="container d-flex justify-content-center">
        {user?.data &&
          <div >
            <h2 className="text-success">User infomation</h2>
            <p>Email: {user.data.email}</p>
            <p>Username: {user.data.username}</p>
            <p>Role: {user.data.role}</p>
          </div>
        }
      </div>
      <div className="mt-4">
        <h2 className="text-center text-danger">Tasks list of {user.data.username}</h2>
        <div className=" d-flex">
          <div className="d-flex border align-items-center w-25 rounded" >
            <Form.Control className="border-0 position-relative "
              value={searchValue}
              placeholder="Search"
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
            />
            {searchValue &&
              <h5 className="position-absolute search_close" onClick={() => setSearchValue("")}> x</h5>
            }
          </div>
          <div className="mx-2">
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_DATA.map((option) => (
                <option
                  value={option.value}>{option.text}</option>
              ))}
            </Form.Select>
          </div>
        </div>
      </div>
      <TaskListComponent
        assigneeOptions={[]}
        tasks={data.data}
        handleDeleteTask={handleDelete}
      />
      <div>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>


  )
})

export default UserInformation