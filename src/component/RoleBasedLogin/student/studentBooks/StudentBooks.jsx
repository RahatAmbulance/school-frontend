import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

const StudentBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.userActual.userData);

    useEffect(() => {
        // TODO: Fetch student's borrowed books from API
        // This is a placeholder data
        setBooks([
            {
                id: 1,
                title: 'Sample Book 1',
                author: 'Author 1',
                borrowDate: '2024-03-01',
                dueDate: '2024-03-15',
                status: 'Borrowed'
            },
            {
                id: 2,
                title: 'Sample Book 2',
                author: 'Author 2',
                borrowDate: '2024-02-15',
                dueDate: '2024-03-01',
                status: 'Overdue'
            }
        ]);
        setLoading(false);
    }, []);

    return (
        <div className="container mt-4">
            <h2>My Library Books</h2>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="table-responsive mt-4">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Book Title</th>
                            <th>Author</th>
                            <th>Borrow Date</th>
                            <th>Due Date</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.borrowDate}</td>
                                <td>{book.dueDate}</td>
                                <td>
                    <span className={`badge ${book.status === 'Overdue' ? 'bg-danger' : 'bg-primary'}`}>
                      {book.status}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentBooks; 