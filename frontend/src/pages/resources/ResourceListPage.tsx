import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Button, CircularProgress, Pagination,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { getResources } from '../../api/resourceApi'
import ResourceCard from './components/ResourceCard'
import ResourceFilter from './components/ResourceFilter'
import { useAuth } from '../../context/AuthContext'
import type { Resource, ResourceStatus, ResourceType } from '../../types/resource'

const EMPTY_FILTERS = {
  type: '' as ResourceType | '',
  location: '',
  minCapacity: '',
  status: '' as ResourceStatus | '',
}

export default function ResourceListPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { load() }, [page, filters])

  const load = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, size: 9 }
      if (filters.type)        params.type = filters.type
      if (filters.location)    params.location = filters.location
      if (filters.minCapacity) params.minCapacity = parseInt(filters.minCapacity)
      if (filters.status)      params.status = filters.status

      const res = await getResources(params)
      setResources(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (f: typeof EMPTY_FILTERS) => {
    setFilters(f)
    setPage(0)
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Campus Resources</Typography>
        {isAdmin() && (
          <Button variant="contained" startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/resources/new')}>
            Add Resource
          </Button>
        )}
      </Box>

      <ResourceFilter
        filters={filters}
        onChange={handleFilterChange}
        onClear={() => handleFilterChange(EMPTY_FILTERS)}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : resources.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>
          No resources found. Try adjusting the filters.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {resources.map((r) => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <ResourceCard resource={r} />
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, p) => setPage(p - 1)}
          />
        </Box>
      )}
    </Box>
  )
}
