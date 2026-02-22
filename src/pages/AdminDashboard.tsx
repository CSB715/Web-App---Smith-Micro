import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import FlagIcon from "@mui/icons-material/Flag";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CategoryIcon from "@mui/icons-material/Category";

import { db, auth } from "../utils/firestore";

const PAGE_LIMIT = 50;

interface SearchResult {
  name: string;
  categories: string[];
  isFlagged: boolean;
}

function AdminDashboard() {
  const hasMounted = useRef(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElCategories, setAnchorElCategories] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [categoryList, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const currentQuery = useRef("");

  // Fetch a page of results from Firestore using prefix search
  const fetchResults = useCallback(async (
    search: string,
    cursor: DocumentSnapshot | null,
    append = false
  ) => {
    setLoading(true);
    currentQuery.current = search;
    try {
      let q;
      if (!search.trim()) {
        // No search term — just load first page ordered by name
        q = cursor
          ? query(collection(db, "Categorization"), orderBy("__name__"), startAfter(cursor), limit(PAGE_LIMIT))
          : query(collection(db, "Categorization"), orderBy("__name__"), limit(PAGE_LIMIT));
      } else {
        // Prefix search on document ID (name field = doc ID in your schema)
        q = cursor
          ? query(
              collection(db, "Categorization"),
              where("__name__", ">=", search),
              where("__name__", "<=", search + "\uf8ff"),
              orderBy("__name__"),
              startAfter(cursor),
              limit(PAGE_LIMIT)
            )
          : query(
              collection(db, "Categorization"),
              where("__name__", ">=", search),
              where("__name__", "<=", search + "\uf8ff"),
              orderBy("__name__"),
              limit(PAGE_LIMIT)
            );
      }

      const snapshot = await getDocs(q);
      const fetched: SearchResult[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          name: doc.id,
          categories: data.category,
          isFlagged: data.is_flagged,
        };
      });

      setSearchResults((prev) => append ? [...prev, ...fetched] : fetched);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
      setHasMore(fetched.length === PAGE_LIMIT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            const data = userDoc.data() as DocumentData;
            if (!data?.isAdmin) {
              await auth.signOut();
              navigate("/login", { replace: true });
            }
          } catch {
            navigate("/login", { replace: true });
          }
        } else {
          navigate("/login", { replace: true });
        }
      });

      // Initial load
      fetchResults("", null);

      // Load categories
      (async () => {
        const categoriesSnapshot = await getDocs(collection(db, "Categories"));
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          setCategories((prev) => [...prev, data.label as string]);
        });
      })();

      return () => unsubscribe();
    }
  }, [navigate, fetchResults]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLastDoc(null);
      fetchResults(searchQuery, null);
    }, 150);
    return () => clearTimeout(timeout);
  }, [searchQuery, fetchResults]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleChipClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
  };

   const handleCategoryClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorElCategories(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleCategoryMenuClose = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorElCategories(null);
    setSelectedIndex(null);
  }

  const handleToggleCategory = async (category: string, shouldAdd: boolean) => {
    if (selectedIndex !== null) {
      const result = searchResults[selectedIndex];
      const currentCategories = result.categories;
      const updatedCategories = shouldAdd
        ? [...currentCategories, category]
        : currentCategories.filter((c) => c !== category);
      await updateDoc(
        doc(db, "Categorization", result.name),
        { category: updatedCategories }
      );
      setSearchResults((prev) =>
        prev.map((r, i) => i === selectedIndex ? { ...r, categories: updatedCategories } : r)
      );
    }
  }


      
      

  const handleToggleFlag = async (shouldFlag: boolean) => {
    if (selectedIndex !== null) {
      await updateDoc(
        doc(db, "Categorization", searchResults[selectedIndex].name),
        { is_flagged: shouldFlag }
      );
      setSearchResults((prev) =>
        prev.map((r, i) => i === selectedIndex ? { ...r, isFlagged: shouldFlag } : r)
      );
    }
    handleMenuClose();
  };

  return (
    <Container maxWidth={false} sx={{ py: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
          Admin Dashboard
        </Typography>

        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "grey.50", border: 1, borderColor: "grey.200" }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Logged in as:</strong> {auth.currentUser?.email}
          </Typography>
        </Paper>

        <TextField
          fullWidth
          placeholder="Search sites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, maxWidth: 600 }}
        />

        <Box sx={{ float: "right" }}>
          <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleSignOut} sx={{ mb: 4 }}>
            Sign Out
          </Button>
        </Box>
      </Box>

      {loading && searchResults.length === 0 ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : searchResults.length > 0 ? (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Results ({searchResults.length}{hasMore ? "+" : ""})
          </Typography>
          <Stack spacing={2}>
            {searchResults.map((result, index) => (
              <Card key={result.name} sx={{ transition: "box-shadow 0.3s", "&:hover": { boxShadow: 4 } }}>
                <CardContent>
                  <Typography variant="h6" component="h4" sx={{ mb: 1.5 }}>
                    {result.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}
                    onClick={(e) => handleCategoryClick(e, index)}>
                    <strong>Categories:</strong> {result.categories.length > 0 ? result.categories.join(", ") : "None"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong>
                    </Typography>
                    <Chip
                      label={result.isFlagged ? "Flagged" : "Not Flagged"}
                      color={result.isFlagged ? "error" : "success"}
                      size="small"
                      variant="filled"
                      onClick={(e) => handleChipClick(e, index)}
                      onDelete={(e) => handleChipClick(e, index)}
                      deleteIcon={<ExpandMoreIcon />}
                      sx={{ cursor: "pointer" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {hasMore && (
            <Button
              variant="outlined"
              onClick={() => fetchResults(searchQuery, lastDoc, true)}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          )}
        </Box>
      ) : (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", bgcolor: "grey.50", border: 1, borderColor: "grey.200" }}>
          <Typography variant="body1" color="text.secondary">
            No results found for "{searchQuery}"
          </Typography>
        </Paper>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem onClick={() => handleToggleFlag(true)}>
          <ListItemIcon><FlagIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Flag Site</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleToggleFlag(false)}>
          <ListItemIcon><FlagOutlinedIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Unflag Site</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        open={Boolean(anchorElCategories)}
        onClose={() => handleCategoryMenuClose(null as any, 0)}
        anchorEl={anchorElCategories}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        transformOrigin={{ vertical: "center", horizontal: "center" }}
      >
        {categoryList.map((category, index) => (
          <MenuItem key={index} onClick={() => handleToggleCategory(category, !searchResults[selectedIndex ?? 0].categories.includes(category))}>
            <ListItemIcon><CategoryIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={category} />
            
            <Chip
              label={searchResults[selectedIndex ?? 0].categories.includes(category) ? "Yes" : "No"}
              color={searchResults[selectedIndex ?? 0].categories.includes(category) ? "success" : "default"}
              size="small"
              variant="outlined"
              sx={{ ml: 2 }}
            />  
          </MenuItem>
        ))}
      </Menu>
    </Container>
  );
}

export default AdminDashboard;