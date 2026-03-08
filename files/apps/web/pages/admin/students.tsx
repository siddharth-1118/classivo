import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import EditModal from '../../components/EditModal';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    axios.get('/api/admin/students').then(res => setStudents(res.data));
  }, []);

  async function handleEdit(fields) {
    const id = students[editIndex].id;
    await axios.put(`/api/students/${id}`, fields);
    const newStudents = [...students];
    newStudents[editIndex] = { ...newStudents[editIndex], ...fields };
    setStudents(newStudents);
  }

  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Roll Number', accessor: 'rollNumber' },
    { Header: 'Class', accessor: 'class', Cell: row => row.class?.name },
    { Header: 'Semester', accessor: 'semester' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Actions', accessor: 'actions', Cell: (row, idx) =>
      <button className="text-blue-500 underline" onClick={() => setEditIndex(idx)}>Edit</button>
    }
  ];

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Manage Students</h1>
      {students.length === 0 ? (
        <div>No students have been added yet.</div>
      ) : (
        <DataTable columns={columns} data={students} />
      )}
      <EditModal
        visible={editIndex >= 0}
        onClose={() => setEditIndex(-1)}
        onSave={handleEdit}
        initial={editIndex >= 0 ? students[editIndex] : {}}
      />
    </Layout>
  );
}