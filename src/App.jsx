import React, { useEffect, useState } from 'react';
import { Input, Table,Button ,Select} from 'antd';
import 'antd/dist/reset.css';
import moment from 'moment';
import './App.css';

const App = () => {
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const Api="http://localhost:3001/table"
  useEffect(() => {
    fetch(Api)
      .then(response => response.json())
      .then(data => setDataSource(data))
      .catch(error => console.error(error));
  }, []);

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' , sorter: (a, b) => a.title.localeCompare(b.title)},
    { title: 'Due Date', dataIndex: 'due_date', key: 'due_date',sorter: (a, b) => moment(a.due_date).diff(moment(b.due_date)) },
   
    {
  title: 'Status',
  dataIndex: 'status',
  key: 'status',
  render: (status, record) => (
    <Select
      defaultValue={status}
      onChange={(value) => handleStatusChange(value, record.id)}
    >
      <Select.Option value="open">Pending</Select.Option>
      <Select.Option value="working">In Progress</Select.Option>
      <Select.Option value="done">Done</Select.Option>
      <Select.Option value="done">Overdue</Select.Option>

    </Select>
  ),
},

    { title: 'Description', dataIndex: 'description', key: 'description',sorter: (a, b) => a.description.localeCompare(b.description) },
    { title: 'Timestamp', dataIndex: 'timeStamp', key: 'timeStamp'  ,sorter: (a, b) => moment(a.timeStamp).diff(moment(b.timeStamp))},
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        
        <Button onClick={() => handleDelete(id)} type="primary" danger>
      Delete
    </Button>
      ),
    },
  ];
const handleStatusChange = async (status, id) => {
  try {
    const response = await fetch(`${Api}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      const updatedItem = await response.json();
      setDataSource(
        dataSource.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    }
  } catch (error) {
    console.error(error);
  }
};

  const filteredData = dataSource.filter(
    item =>
      item.title.includes(searchText) ||
      item.tag.includes(searchText) ||
      item.status.includes(searchText)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));
    data.timeStamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    try {
      const response = await fetch(Api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const newItem = await response.json();
      setDataSource([...dataSource, newItem]);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${Api}/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDataSource(dataSource.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (<>
  
    <div className="container">
      <div>
       
      </div>
      
      <div>
        
        <div className='inp'><h2>Add Items</h2><input onChange={(e) => setSearchText(e.target.value)} placeholder='Search' /></div>
      </div>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" required maxLength={100} />
        <input name="due_date" type="date" required />
        <input name="description" placeholder="Description" required maxLength={1000}/>
        <button type="submit" disabled={isSubmitting}  style={{marginLeft:"10px"}}>
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </button>
        
      </form>
      <Table dataSource={filteredData} columns={columns} />
 

    </div></>
  );
};

export default App;