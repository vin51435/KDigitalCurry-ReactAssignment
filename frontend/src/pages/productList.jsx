import React, { useEffect, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCombinations, fetchGrades, fetchMaterials, fetchProducts } from '../redux/reducers/productSlice';
import { FaSort } from "react-icons/fa";
import AddProduct from '../components/addProduct';
import UpdateCombinationForm from '../components/updateCombinations';
import { LuPlus } from "react-icons/lu";
import Spinner from '../assets/Spinner';

const ProductList = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [filters, setFilters] = useState({
    productName: null, materialId: null, searchQuery: null, sortOrder: 'asc', sortBy: 'name', limit: 5, page: 1
  });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState({});
  const [load, setLoad] = useState(true);

  const products = useSelector((state) => state.product.products);
  const materials = useSelector((state) => state.product.materials);
  const { data = [] } = useSelector((state) => state.product.data);

  const dispatch = useDispatch();

  const fetchCombinationsFnc = () => {
    dispatch(fetchCombinations({ page: filters.page, limit: filters.limit, sortBy: filters.sortBy, sortOrder: filters.sortOrder, productName: filters.productName, searchQuery: filters.searchQuery, materialId: filters.materialId }))
      .then(() => setLoad(false))
      .catch(() => {
        setLoad(false);
        alert('Failed loading data');
      });
  };

  useEffect(() => {
    fetchCombinationsFnc();
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchMaterials());
    dispatch(fetchGrades());
  }, [dispatch]);

  function truncateSentence(sentence, maxLength) {
    if (sentence.length <= maxLength) return sentence;
    return sentence.slice(0, maxLength).trim() + '...';
  }

  const columns = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className='d-flex justify-content-center align-items-center h-100 w-100'>
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='d-flex justify-content-center align-items-center h-100 w-100'>
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </div>
      ),
      size: 30,
      minWidth: 50,  // Minimum width for this column
      flexGrow: 1    // This column can grow
    },
    {
      header: "Products",
      cell: ({ row }) => {
        const productName = row.original.productId.name;
        const materialName = row.original.materialId.name;
        const gradeName = row.original.gradeIds[0]?.name; // Optional chaining for safety
        return <p className='ps-1'>{`${productName} ${materialName} ${gradeName}`}</p>;
      },
      size: 130,
      minWidth: 150,   // Minimum width for this column
      flexGrow: 2,     // This column can grow more
      sortName: 'name'
    },
    {
      accessorKey: 'action', // This can remain as a placeholder
      header: "Action",
      cell: ({ row }) => (
        <div className='text-primary d-flex ps-1' style={{ cursor: 'pointer' }} onClick={() => {
          setExpandedRowId(row.id);
        }}>Quick Edit | Add Product Details
        </div>
      ),
      size: 150,
      minWidth: 180,   // Minimum width for this column
      flexGrow: 1      // This column can grow
    },
    {
      header: "Product Details",
      cell: ({ row }) => (
        <p>
          {truncateSentence(`Material: ${row.original.materialId.name}, Unit Length: ${row.original.length}, Shape: ${row.original.shape}, Thickness: ${row.original.thickness}`, 60)}
        </p>
      ),
      minWidth: 250,   // Minimum width for this column
      flexGrow: 3      // This column can grow a lot
    },
    {
      header: "Price in Unit",
      cell: ({ row }) => <p>{`${row.original.price} / ${row.original.weight}`}</p>,
      size: 80,
      width: 50,   // Minimum width for this column
      flexGrow: 1,     // This column can grow
      sortName: 'price'
    },
  ];

  // table instance
  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      size: 200,
      minSize: 50,
      maxSize: 500,
    },
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection: selectedRowIds,
    },
    onRowSelectionChange: setSelectedRowIds,
    getRowId: (row) => row._id,
  });

  const handleNextPage = () => setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  const handlePreviousPage = () => setFilters((prev) => ({ ...prev, page: prev.page > 1 ? prev.page - 1 : prev }));

  const showAddFnc = (bool) => {
    setShowAdd(bool);
  };

  return (
    <div className='position-relative' style={{ width: 'fit-content' }}>
      <div className='mb-3 mt-3 '>
        <button className='d-flex justify-content-center align-items-center fs-6 fnc-button border border-0 blue_bg text-white rounded-pill px-5 py-2' onClick={() => showAddFnc(true)}>
          <span className='me-2'><LuPlus /></span>
          Add combination
        </button>
      </div>
      <div className='w-auto h-auto mb-3'>
        <div className="search-container d-flex align-items-center d-flex">
          <input value={filters?.searchQuery} onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))} type="text" placeholder="Search Products..." className="rounded-start search-input p-2 border-0" />
          <button className="rounded-end search-button p-2 border-0 px-4 d-flex align-items-center blue_bg">Search</button>
        </div>
      </div>

      {showAdd && <AddProduct showAddFnc={showAddFnc} fetchCombinationsFnc={fetchCombinationsFnc} />}
      <div className='d-flex flex-row mb-3'>
        <div className='d-flex flex-row me-4 gap-2'>
          <select
            className='w250 form-select border-0'
            value={filters.productName || ''}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, productName: e.target.value, page: 1 }));
            }}>
            <option value=''>Products</option>
            {products.map((product) => (
              <option key={product._id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
          <select
            className='w250 form-select border-0'
            value={filters.materialId || ''}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, materialId: e.target.value, page: 1 }));
            }}>
            <option value=''>Materials</option>
            {materials.map((material) => (
              <option key={material._id} value={material._id}>
                {material.name}
              </option>
            ))}
          </select>
          <button className='w100 btn bg-white rounded' onClick={() => setFilters({ productName: null, materialId: null })}>
            clear
          </button>
        </div>
        <div className='d-flex flex-row me-4 gap-2'>
          <select
            className='w250 form-select border-0'          >
            <option value=''>Bulk Actions</option>
          </select>
          <button className='w100 btn bg-white rounded' >
            Apply
          </button>
        </div>
      </div>
      <table className='position-relative'>
        <thead className='neonBlue_bg '>
          <tr>
            {table.getHeaderGroups().map(headerGroup => (
              <React.Fragment key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className={`position-relative py-2 px-1 fw-semibold`}
                    style={{ width: header.column.columnDef.size || 'auto' }}
                    onClick={() => {
                      if (header.column.columnDef.sortName) {
                        setFilters(prev => ({
                          ...prev,
                          sortBy: header.column.columnDef.sortName,
                          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                        }));
                      }
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.columnDef.sortName && <span style={{ cursor: 'pointer' }}><FaSort /></span>}
                  </th>
                ))}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        {load &&
          <td colSpan={5} className="text-center" style={{ height: '100px' }}>
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
              <Spinner size={40} />
            </div>
          </td>
        }
        <tbody>
          {table.getRowModel().rows.map(row => (
            <React.Fragment key={row.id}>
              <tr className='border border-secondary-subtle'>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className='fs-6 py-1 ' style={{ width: cell.column.columnDef.size || 'auto' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {expandedRowId === row.id && (
                <tr>
                  <td colSpan={table.getAllColumns().length}>
                    <div className={`expandable-content ${expandedRowId === row.id ? 'expanded' : ''}`}>
                      <UpdateCombinationForm row={row} setExpandedRowId={setExpandedRowId} fetchCombinationsFnc={fetchCombinationsFnc} />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '10px' }}>
        <button
          className='w100 btn bg-white rounded'
          onClick={() => {
            setExpandedRowId(null);
            handlePreviousPage();
          }} disabled={filters.page === 1}>
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>Page {filters.page}</span>
        <button
          className='w100 btn bg-white rounded'
          onClick={() => {
            setExpandedRowId(null);
            handleNextPage();
          }} disabled={data?.length < filters.limit}>
          Next
        </button>
      </div>
    </div >

  );
};

export default ProductList;
