/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCombinations, fetchGrades, fetchMaterials, fetchProducts } from '../redux/reducers/productSlice';
import { FaSort } from "react-icons/fa";
import AddProduct from './addProduct';
import axios from 'axios';


const ProductList = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    productName: null, materialId: null
  });
  const [showAdd, setShowAdd] = useState(false);

  const products = useSelector((state) => state.product.products);
  const materials = useSelector((state) => state.product.materials);
  const grades = useSelector((state) => state.product.grades);
  const { data = [] } = useSelector((state) => state.product.data);

  const dispatch = useDispatch();

  const fetchCombinationsFnc = () => {
    dispatch(fetchCombinations({ page, limit, sortBy, sortOrder, productName: filters.productName, materialId: filters.materialId }));
  };

  useEffect(() => {
    fetchCombinationsFnc();
  }, [dispatch, page, limit, sortBy, sortOrder, filters]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchMaterials());
    dispatch(fetchGrades());
  }, [dispatch]);

  const columns = [
    {
      header: "Products",
      cell: ({ row }) => {
        const productName = row.original.productId.name;
        const materialName = row.original.materialId.name;
        const gradeName = row.original.gradeIds[0]?.name; // Optional chaining for safety
        return <p>{`${productName} + ${materialName} + ${gradeName}`}</p>;
      },
      size: 100,
      sortName: 'name'
    },
    {
      accessorKey: 'action', // This can remain as a placeholder
      header: "Actions",
      cell: ({ row }) => (
        <div className='text-primary' style={{ cursor: 'pointer' }} onClick={(e) => {
          console.log(row.id);
          setExpandedRowId(row.id);
        }}>Quick Edit | Add Product Details
        </div>
      ),
      size: 100,
    },
    {
      header: "Product Details",
      cell: ({ row }) => (
        <p>
          {`Material: ${row.original.materialId.name}, Unit Length: ${row.original.length}, Shape: ${row.original.shape}, Thickness: ${row.original.thickness}`}
        </p>
      ) // Use parentheses for implicit return
    },
    {
      header: "Price in Unit",
      cell: ({ row }) => <p>{`${row.original.price} / ${row.original.weight}`}</p>,
      sortName: 'price'
    },
  ];

  // table instance
  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      size: 200, //starting column size
      minSize: 50, //enforced during column resizing
      maxSize: 500, //enforced during column resizing
    },
    getCoreRowModel: getCoreRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    columnResizeMode: 'onChange'
  });

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePreviousPage = () => setPage((prev) => (prev > 1 ? prev - 1 : prev));

  const showAddFnc = (bool) => {
    setShowAdd(bool);
  };


  const UpdateCombinationForm = ({ row, setExpandedRowId, fetchCombinationsFnc }) => {
    const [formData, setFormData] = useState({
      productId: row.original.productId._id,
      materialId: row.original.materialId._id,
      gradeIds: row.original.gradeIds || [],
      shape: row.original.shape || '',
      length: row.original.length || '',
      thickness: row.original.thickness || '',
      price: row.original.price || '',
      currency: row.original.currency || '',
    });

    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      const combinationId = row.original._id; // Get the combination ID

      try {
        const response = await axios.put(`http://localhost:5000/update-combination/${combinationId}`, {
          ...formData,
        });

        console.log('Update successful:', response.data);
        alert(response.data.message);
        setExpandedRowId(null);
        fetchCombinationsFnc();
      } catch (error) {
        console.error('Error updating combination:', error);
        // Optionally handle error (e.g., show an error message)
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <label>
          Product Name:
          <input
            type="text"
            value={row.original.productId.name}
            readOnly // Assuming product name is not editable
          />
        </label>
        <label>
          Material:
          <input
            type="text"
            value={row.original.materialId.name}
            readOnly // Assuming material name is not editable
          />
        </label>
        <label>
          Grade IDs:
          <input
            type="text"
            name="gradeIds"
            value={formData.gradeIds.join(', ')} // Display as comma-separated values
            onChange={(e) => handleChange({
              target: {
                name: 'gradeIds',
                value: e.target.value.split(',').map(id => id.trim()), // Update gradeIds on change
              }
            })}
          />
        </label>
        <label>
          Shape:
          <input
            type="text"
            name="shape"
            value={formData.shape}
            onChange={handleChange}
          />
        </label>
        <label>
          Length:
          <input
            type="number"
            name="length"
            value={formData.length}
            onChange={handleChange}
          />
        </label>
        <label>
          Thickness:
          <input
            type="number"
            name="thickness"
            value={formData.thickness}
            onChange={handleChange}
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
          />
        </label>
        <label>
          Currency:
          <input
            type="text"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Save</button>
        <button type="button" onClick={() => setExpandedRowId(null)}>Cancel</button>
      </form>
    );
  };

  return (
    <div className='position-relative'>
      <div className='mb-5 mt-3'>
        <button onClick={() => showAddFnc(true)}>Add combination</button>
      </div>
      {showAdd && <AddProduct showAddFnc={showAddFnc} fetchCombinationsFnc={fetchCombinationsFnc}/>}
      <div className='d-flex'>
        <div>
          <label>Product:</label>
          <select
            value={filters.productName || ''}
            onChange={(e) => {
              setPage(1);
              setFilters(prev => ({ ...prev, productName: e.target.value }));
            }}>
            <option value=''>Filter Products</option>
            {products.map((product) => (
              <option key={product._id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Material:</label>
          <select
            value={filters.materialId || ''}
            onChange={(e) => {
              setPage(1);
              setFilters(prev => ({ ...prev, materialId: e.target.value }));
            }}>
            <option value=''>Filter Material</option>
            {materials.map((material) => (
              <option key={material._id} value={material._id}>
                {material.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button onClick={(e) => setFilters({ productName: null, materialId: null })}>
            clear
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            {table.getHeaderGroups().map(headerGroup => (
              <React.Fragment key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className={`position-relative`}
                    onClick={() => {
                      if (header.column.columnDef.sortName) {
                        setSortBy(header.column.columnDef.sortName);
                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      }
                    }}
                  >
                    {header.column.columnDef.header} {/* Render the header */}
                    {header.column.columnDef.sortName && <FaSort />}
                  </th>
                ))}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <React.Fragment key={row.id}>
              <tr>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {expandedRowId === row.id && (
                <tr>
                  <td colSpan={table.getAllColumns().length} >
                    <UpdateCombinationForm row={row} setExpandedRowId={setExpandedRowId} fetchCombinationsFnc={fetchCombinationsFnc} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>Page {page}</span>
        <button onClick={handleNextPage} disabled={data?.length < limit}>
          Next
        </button>
      </div>
    </div >

  );
};

export default ProductList;
