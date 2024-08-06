'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
} from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openSearchModal, setOpenSearchModal] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => { setOpenAddModal(true) }

  const handleClose = () => {
    setOpenAddModal(false)
    setItemName('')
    setItemQuantity('')
    setOpenSearchModal(false)
    setSearchTerm('')
    setSearchResults([])
  }

  const handleSearch = () => {
    const results = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setSearchResults(results)
    setOpenSearchModal(true)
  }

  const addItem = async (itemName, itemQuantity) => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + itemQuantity })
    } else {
      await setDoc(docRef, { quantity: itemQuantity })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const increaseItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    }
    await updateInventory()
  }

  return (
    <Box
      display={'flex'}
      width={'70vw'}
      height={'100vh'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        marginTop: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Box>
        <Typography variant="h1" color={'#444'} sx={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          textDecoration: 'underline',
          textUnderlineOffset: '0.1em',
          textDecorationColor: '#444',
          textDecorationThickness: '0.05em'
        }}>
          Pantry Tracker
        </Typography>
      </Box>
      <Modal
        open={openAddModal}
        onClose={handleClose}
        aria-labelledby="add-item-modal-title"
        aria-describedby="add-item-modal-description"
      >
        <Box sx={style}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography id="add-item-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
            <Button onClick={handleClose}>X</Button>
          </Box>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Name"
              type="text"
              fullWidth
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))}
              error={itemName.trim() === ''}
              helperText={itemName.trim() === '' ? 'Name is required' : ''}
            />
            <TextField
              id="outlined-number"
              label="Quantity"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              required
              inputProps={{
                min: 1,
              }}
              value={itemQuantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1) {
                  setItemQuantity(value.toString());
                }
              }}
              error={itemQuantity === '' || parseInt(itemQuantity) < 1}
              helperText={itemQuantity === '' || parseInt(itemQuantity) < 1 ? 'Quantity must be 1 or greater' : ''}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, parseInt(itemQuantity))
                setItemName('')
                setItemQuantity('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="95%" >
          <Box display="flex" alignItems="center">
            <TextField
              label="Search Inventory"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ m: '0 1rem', opacity: 1 }}
            />
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Box>
          <Button variant="contained" onClick={handleOpen} sx={{ ml: '1rem' }}>
            Add New Item
          </Button>
        </Box>

        <Modal
          open={openSearchModal && searchTerm.trim() !== ''}
          onClose={handleClose}
          aria-labelledby="search-results-title"
          aria-describedby="search-results-description"
        >
          <Box sx={style}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography id="search-results-title" variant="h6" component="h2">
                Search Results
              </Typography>
              <Button onClick={handleClose}>X</Button>
            </Box>
            <Stack spacing={2}>
              {searchResults.length > 0 ? (
                searchResults.map(({ name, quantity }) => (
                  <Card key={name} sx={{ bgcolor: '#e0f7fa' }}>
                    <CardContent>
                      <Typography variant="h6">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                      <Typography variant="body1">Quantity: {quantity}</Typography>
                      <Button variant="contained" onClick={() => increaseItem(name)}>Add</Button>
                      <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body1">No results found</Typography>
              )}
            </Stack>
          </Box>
        </Modal>

        <TableContainer component={Paper} sx={{ width: "70vw", overflow: 'auto' }}>
          <Table>
            <TableHead bgcolor={'#ADD8E6'} color={'white'}>
              <TableRow>
                <TableCell align="center"><Typography variant="h6" fontWeight="bold">Name</Typography></TableCell>
                <TableCell align="center"><Typography variant="h6" fontWeight="bold">Quantity</Typography></TableCell>
                <TableCell align="center"><Typography variant="h6" fontWeight="bold">Action</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map(({ name, quantity }) => (
                <TableRow key={name} sx={{ bgcolor: '#e0f7fa' }}>
                  <TableCell align="center">
                    <Typography variant="h6">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6">
                      {quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="contained" onClick={() => increaseItem(name)} sx={{ mr: 1 }}>
                      Add
                    </Button>
                    <Button variant="contained" onClick={() => removeItem(name)}>
                      {quantity === 1 ? 'Delete' : 'Remove'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}