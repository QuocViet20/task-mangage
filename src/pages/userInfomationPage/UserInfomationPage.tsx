
import { useMutation , useQuery } from "@tanstack/react-query"
import { memo, useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import _ from "lodash"
import {
  Button,
  Form,
  Modal,
  Table
} from "react-bootstrap";
import { toast } from "react-toastify";
import moment from "moment";

//components
import Loading from "../../components/elements/loading/Loading";
import PaginationComponent from "../../components/elements/panigation/Pagination";

//types
import { Task } from "../../types";
import { RECORDS_PER_PAGE, STATUS_DATA } from "../../consts";

//api
import { getTaskAssignee, getUserId, deleteTask } from "../../api/serviceApi";

// hooks
import useDebounce from "../../hooks/useSearch";


const UserInformation = memo(()=> {
  const { userId }= useParams();
  const [ show, setShow] = useState(false);
  const navigate= useNavigate();
  const [searchParams] = useSearchParams();
  const [ searchValue, setSearchValue ] = useState("");
  const [selectedStatus, setSelectedStatus ] = useState(STATUS_DATA[0].value)
  const debouncedSearchHook = useDebounce(searchValue, 1000);

  const currentPage = Number(searchParams.get("page")) || 1;
  
  const queryParams = selectedStatus 
  ? {
    currentPage,
    limit: RECORDS_PER_PAGE,
    debouncedSearchHook,
    selectedStatus,
    assignee:userId as string
  } 
  : { 
    currentPage,
    limit: RECORDS_PER_PAGE,
    debouncedSearchHook,
    assignee:userId as string
  }

  const { data, isLoading, refetch }: any = useQuery({
    queryKey: [
      "tasks",
      queryParams.currentPage,
      queryParams.debouncedSearchHook,
      queryParams.selectedStatus,
      queryParams.assignee
    ],
    queryFn: () => getTaskAssignee(queryParams)
  })

  const {
    data:user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery( {
    queryFn: () => getUserId(userId as string),
    enabled: !_.isNil(userId)
  })

  const totalPages = useMemo(() => {
    if(_.isNil(data) || _.isNil(data.headers["x-total-count"])){
      return 0
    };
    return Math.ceil(
      parseInt(data.headers["x-total-count"])/RECORDS_PER_PAGE
    )
  },[data])

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      toast.success("Delete task success",{
        position: toast.POSITION.TOP_RIGHT
      });
      refetch();
    }
  })
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  const onPageChange = (pageNumber: number) => {
    navigate(`/tasks?page=${pageNumber}`)
  }

  if(isLoading){
    return <Loading />
  }

   if(isUserLoading){
    return <Loading />
   }
   if(isUserError){
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUS_DATA.map((option)=>(
                <option 
                value={option.value}>{option.text}</option>
              ))}
            </Form.Select>
          </div>
        </div>
    </div>
    <div className="mt-4">
       {
        data?.data.length>0 ? (
          <Table striped bordered hover variant="light" className="mt-4">
          <thead>
            <tr className= "text-center">
              <th>NO</th>
              <th>Title</th>
              <th>Start time</th>
              <th>End time</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            { data.data.map((task: Task, index: number) => (
              <tr key={task.id} className= "text-center">
                <td>{index+1}</td>
                <td>{task.title}</td>
                <td>{moment(task.startTime).format('DD/MM /YYYY HH:mm A')}</td>
                <td>{moment(task.endTime).format('DD/MM /YYYY HH:mm A')}</td>
                <td className="text-danger" >{task.progress}%</td>
                <td className="text-success">{task.status}</td>
                <td><Link to ={`/tasks/${task.id}/edit`}><Button className="btn btn-warning">Edit</Button></Link></td>
                <td><Button className="btn btn-danger" onClick={()=>setShow(true)}>Delete</Button></td>
                <Modal show={show} onHide={() => setShow(false)}>
                  <Modal.Header closeButton >
                    <Modal.Title className="text-center">Delete user</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="text-center">Are you sure you want to delete?</Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleDelete(task.id as number);
                        setShow(false);
                      }}
                    >
                      Delete
                    </Button>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                      close
                    </Button>
                  </Modal.Footer>
                </Modal>
              </tr>
              
            ))
            }
          </tbody>
          
            
       </Table>
        ): (
          <h2 className="mt-4 text-center text-warning"> No Tasks</h2>
        )
       } 
       
    </div>
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