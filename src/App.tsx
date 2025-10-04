import { styled } from '@mui/material/styles';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddBoxOutlined,
  AltRoute,
  Dangerous,
  Engineering,
  FirstPage,
  GridView,
  HistoryToggleOff,
  Hub,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
  RemoveCircleOutline,
  RestartAlt,
  Storage,
  Sync,
  SyncLock,
} from '@mui/icons-material';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Slide, { SlideProps } from '@mui/material/Slide';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import appLogo from './assets/Q-Node.png';
import noAvatar from './assets/noavatar.png';
import NodeWidget from './components/NodeWidget';
import { useTheme } from '@mui/material/styles';
import {
  ChangeEvent,
  Key,
  MouseEvent,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

function secondsToDhms(seconds: number) {
  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d == 1 ? 'd ' : 'd ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? 'h ' : 'h ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? 'm ' : 'm ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? 's' : 's') : '';

  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
      </IconButton>

      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>

      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>

      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
      </IconButton>
    </Box>
  );
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#02648d',
    color: theme.palette.common.white,
    fontSize: 14,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const DialogGeneral = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialog-paper': {
    borderRadius: '15px',
  },
  '& .MuiTextField-root': {
    width: '50ch',
  },
}));

function App() {
  const { t } = useTranslation(['core']);
  const theme = useTheme();

  const [isUsingGateway, setIsUsingGateway] = useState(true);
  const [nodeData, setNodeData] = useState<any>(null);
  const [mintingAccounts, setMintingAccounts] = useState<any>([]);
  const [connectedPeers, setConnectedPeers] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorSnackbar, setErrorSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingMintingAccountsTable, setLoadingMintingAccountsTable] =
    useState(true);
  const [openMintingAccountDialog, setOpenMintingAccountDialog] =
    useState(false);
  const [mintingAccountKey, setMintingAccountKey] = useState('');
  const [openPeerDialog, setOpenPeerDialog] = useState(false);
  const [newPeerAddress, setNewPeerAddress] = useState('');

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - connectedPeers.length)
      : 0;

  function handleCloseSuccessSnackbar(
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessSnackbar(false);
    setSuccessMessage('');
  }

  function handleCloseErrorSnackbar(
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) {
    if (reason === 'clickaway') {
      return;
    }
    setErrorSnackbar(false);
    setErrorMessage('');
  }

  function handleCloseAddMintingAccountDialog() {
    setMintingAccountKey('');
    setOpenMintingAccountDialog(false);
  }

  function handleCloseAddPeerDialog() {
    setNewPeerAddress('');
    setOpenPeerDialog(false);
  }

  async function handleRestartNode() {
    try {
      const response = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'restart',
      });
      if (!response?.error) {
        setSuccessMessage(
          t('core:message.generic.success.restart_request', {
            postProcess: 'capitalizeFirstChar',
          })
        );
        setErrorMessage('');
        setErrorSnackbar(false);
        setSuccessSnackbar(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
      setSuccessSnackbar(false);
      setErrorSnackbar(true);
    }
  }

  async function handleBootstrapNode() {
    try {
      const response = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'bootstrap',
      });
      if (!response?.error) {
        setSuccessMessage(
          t('core:message.generic.success.bootstrap_request', {
            postProcess: 'capitalizeFirstChar',
          })
        );
        setErrorMessage('');
        setErrorSnackbar(false);
        setSuccessSnackbar(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
      setSuccessSnackbar(false);
      setErrorSnackbar(true);
    }
  }

  async function handleStopNode() {
    try {
      const response = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'stop',
      });
      if (!response?.error) {
        setSuccessMessage(
          t('core:message.generic.success.stop_request', {
            postProcess: 'capitalizeFirstChar',
          })
        );
        setErrorMessage('');
        setErrorSnackbar(false);
        setSuccessSnackbar(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
      setSuccessSnackbar(false);
      setErrorSnackbar(true);
    }
  }

  async function handleAddMintingAccount(mintingKey: string) {
    try {
      const response = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'addmintingaccount',
        value: mintingKey,
      });
      if (!response?.error) {
        setSuccessMessage(
          t('core:message.generic.success.new_minting_account', {
            postProcess: 'capitalizeFirstChar',
          })
        );
        setErrorMessage('');
        setErrorSnackbar(false);
        setSuccessSnackbar(true);
        setOpenMintingAccountDialog(false);
        getMintingAccounts();
        setMintingAccountKey('');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
      setSuccessSnackbar(false);
      setErrorSnackbar(true);
      setOpenMintingAccountDialog(false);
      getMintingAccounts();
      setMintingAccountKey('');
    }
  }

  async function handleRemoveMintingAccount(publicKey: string) {
    try {
      const response = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'removemintingaccount',
        value: publicKey,
      });
      if (!response?.error) {
        setSuccessMessage(
          t('core:message.generic.success.remove_minting_account', {
            postProcess: 'capitalizeFirstChar',
          })
        );
        setErrorMessage('');
        setErrorSnackbar(false);
        setSuccessSnackbar(true);
        getMintingAccounts();
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
      setSuccessSnackbar(false);
      setErrorSnackbar(true);
      getMintingAccounts();
    }
  }

  async function handleAddPeer(peerAddress: string) {
    try {
      const response = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'addpeer',
        value: peerAddress,
      });
      if (!response?.error) {
        setSuccessMessage(
          t('core:message.generic.success.new_peer', {
            postProcess: 'capitalizeFirstChar',
          })
        );
        setErrorMessage('');
        setErrorSnackbar(false);
        setSuccessSnackbar(true);
        setOpenPeerDialog(false);
        getConnectedPeers();
        setNewPeerAddress('');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
      setSuccessSnackbar(false);
      setErrorSnackbar(true);
      setOpenPeerDialog(false);
      getConnectedPeers();
      setNewPeerAddress('');
    }
  }

  async function handleRemovePeer(peerAddress: string) {
    try {
      const response = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'removepeer',
        value: peerAddress,
      });
      if (!response?.error) {
        setSuccessMessage(
          t('core:message.generic.success.remove_peer', {
            postProcess: 'capitalizeFirstChar',
          })
        );
        setErrorMessage('');
        setErrorSnackbar(false);
        setSuccessSnackbar(true);
        getConnectedPeers();
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
      setSuccessSnackbar(false);
      setErrorSnackbar(true);
      getConnectedPeers();
    }
  }

  async function handleForceSync(peerAddress: string) {
    try {
      const response = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'forcesync',
        value: peerAddress,
      });
      if (!response?.error) {
        setSuccessMessage(
          t('core:message.generic.starting_synch_peer', {
            postProcess: 'capitalizeFirstChar',
            address: peerAddress,
          })
        );
        setErrorMessage('');
        setErrorSnackbar(false);
        setSuccessSnackbar(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
      setSuccessSnackbar(false);
      setErrorSnackbar(true);
    }
  }

  function handleChangePage(
    _event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  async function getIsUsingGateway() {
    try {
      const res = await qortalRequest({
        action: 'IS_USING_PUBLIC_NODE',
      });
      setIsUsingGateway(res);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getIsUsingGateway();
  }, []);

  async function getNodeInfo() {
    try {
      const nodeInfo = await qortalRequest({
        action: 'GET_NODE_INFO',
      });
      const nodeStatus = await qortalRequest({
        action: 'GET_NODE_STATUS',
      });
      return { ...nodeInfo, ...nodeStatus };
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    let isRunning = false;

    const fetchNodeData = async () => {
      if (isRunning) return;
      isRunning = true;
      try {
        const data = await getNodeInfo();
        setNodeData(data);
      } finally {
        isRunning = false;
      }
    };

    fetchNodeData(); // fetch once immediately

    const intervalId = setInterval(fetchNodeData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  async function getNameInfo(address: string) {
    const nameLink = `/names/address/${address}?limit=0&reverse=true`;
    const nameResponse = await fetch(nameLink);
    const nameResult = await nameResponse.json();
    if (nameResult?.length > 0) {
      return {
        name: nameResult[0].name,
        avatar:
          '/arbitrary/THUMBNAIL/' +
          nameResult[0].name +
          '/qortal_avatar?async=true',
      };
    } else {
      return {
        name: 'No Registered Name',
        avatar: noAvatar,
      };
    }
  }

  async function getMintingAccounts() {
   
    setLoadingMintingAccountsTable(true);
    try {
      const list = await qortalRequest({
        action: 'ADMIN_ACTION',
        type: 'getmintingaccounts',
      });
      
      // Enrich in parallel and WAIT for them
      const enriched = await Promise.all(
        list.map(async (item) => {
          const nameRes = await getNameInfo(item.mintingAccount);
          return {
            publicKey: item.publicKey,
            mintingAccount: item.mintingAccount,
            recipientAccount: item.recipientAccount,
            name: nameRes?.name ?? null,
            avatar: nameRes?.avatar ?? null,
          };
        })
      );

      setMintingAccounts(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMintingAccountsTable(false);
    }
  }

  useEffect(() => {
    let isRunning = false;

    const fetchAccounts = async () => {
      if (isRunning) return;
      isRunning = true;
      try {
        await getMintingAccounts();
      } finally {
        isRunning = false;
      }
    };

    fetchAccounts(); // initial

    const intervalId = setInterval(fetchAccounts, 300000);

    return () => clearInterval(intervalId);
  }, []);

  async function getConnectedPeers() {
    const connectedPeersLink = `/peers`;
    const fetchConnectedPeers = async () => {
      const connectedPeersFetch = await fetch(connectedPeersLink);
      const connectedPeersResponse = await connectedPeersFetch.json();
      setConnectedPeers(connectedPeersResponse);
    };
    const resolveConnectedPeers = await Promise.all([fetchConnectedPeers()]);
    return resolveConnectedPeers;
  }

  useEffect(() => {
    let connectedPeersInterval: number | undefined;
    (async () => {
      connectedPeersInterval = setInterval(async () => {
        await getConnectedPeers();
      }, 120000);
      await getConnectedPeers();
    })();
    return () => {
      clearInterval(connectedPeersInterval);
    };
  }, []);

  const nodeButtons = () => {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: '10px',
          justifyContent: 'end',
          marginRight: '10px',
          width: 'auto',
        }}
      >
        <Tooltip title="Restart Node">
          <IconButton
            onClick={handleRestartNode}
            sx={{ p: 0, marginTop: '3px' }}
          >
            <RestartAlt color="success" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Bootstrap Node">
          <IconButton
            onClick={handleBootstrapNode}
            sx={{ p: 0, marginTop: '3px' }}
          >
            <Storage color="warning" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Stop Node">
          <IconButton onClick={handleStopNode} sx={{ p: 0, marginTop: '3px' }}>
            <Dangerous color="error" />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  const mintingAccountsHeader = () => {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Typography variant="h6">
          {t('core:message.generic.minting_account', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Typography>
        <Button
          disabled={isUsingGateway}
          size="small"
          onClick={() => {
            setOpenMintingAccountDialog(true);
          }}
          startIcon={<AddBoxOutlined />}
          variant="outlined"
          style={{ borderRadius: 50 }}
        >
          {t('core:action.add_minting_account', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Button>
      </div>
    );
  };

  const connectedPeersHeader = () => {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Typography variant="h6">
          {t('core:message.generic.connected_peers', {
            postProcess: 'capitalizeFirstChar',
            count: connectedPeers.length,
          })}
        </Typography>
        <Button
          disabled={isUsingGateway}
          size="small"
          onClick={() => {
            setOpenPeerDialog(true);
          }}
          startIcon={<AddBoxOutlined />}
          variant="outlined"
          style={{ borderRadius: 50 }}
        >
          {t('core:action.add_peer', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Button>
      </div>
    );
  };

  const tableMintingAccounts = () => {
    if (mintingAccounts && mintingAccounts.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table
            stickyHeader
            sx={{ width: '100%' }}
            aria-label="payments-table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">
                  {t('core:table_headers.minting_accounts.avatar', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.minting_accounts.name', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.minting_accounts.address', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.minting_accounts.minting_key', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.minting_accounts.action', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mintingAccounts.map(
                (
                  row: {
                    publicKey: string;
                    mintingAccount: string;
                    recipientAccount: string;
                    name: string;
                    avatar: string;
                  },
                  a: Key
                ) => (
                  <StyledTableRow key={a}>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <Avatar
                        alt="Avatar"
                        src={row?.avatar}
                        sx={{ width: 24, height: 24 }}
                      />
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.name}
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.mintingAccount}
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.publicKey}
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <Button
                        disabled={isUsingGateway}
                        size="small"
                        color="error"
                        startIcon={<RemoveCircleOutline />}
                        onClick={() => {
                          handleRemoveMintingAccount(row?.publicKey);
                        }}
                      >
                        {t('core:action.remove', {
                          postProcess: 'capitalizeFirstChar',
                        })}
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: theme.palette.text.primary, fontWeight: 700 }}
        >
          {t('core:message.generic.no_minting_accounts', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Typography>
      );
    }
  };

  const tableConnectedPeers = () => {
    if (connectedPeers && connectedPeers.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table
            stickyHeader
            sx={{ width: '100%' }}
            aria-label="payments-table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">
                  {t('core:table_headers.peers.address', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.peers.handshake_status', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.peers.last_height', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.peers.core_version', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.peers.connected_since', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {t('core:table_headers.peers.actions', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(rowsPerPage > 0
                ? connectedPeers.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : connectedPeers
              ).map(
                (
                  row: {
                    address: string;
                    age: string;
                    connectedWhen: number;
                    connectionId: string;
                    direction: string;
                    handshakeStatus: string;
                    isTooDivergent: boolean;
                    lastBlockSignature: string;
                    lastBlockTimestamp: number;
                    lastHeight: number;
                    lastPing: number;
                    nodeId: string;
                    peersConnectedWhen: number;
                    version: string;
                  },
                  i: Key
                ) => (
                  <StyledTableRow key={i}>
                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.address}
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.handshakeStatus === 'COMPLETED' ? (
                        <div style={{ color: '#66bb6a' }}>
                          {row?.handshakeStatus}
                        </div>
                      ) : (
                        <div style={{ color: '#ffa726' }}>
                          {row?.handshakeStatus}
                        </div>
                      )}
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.lastHeight}
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.version ? row?.version.replace('qortal-', 'v') : ''}
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      {row?.age}
                    </StyledTableCell>

                    <StyledTableCell style={{ width: 'auto' }} align="left">
                      <Button
                        disabled={isUsingGateway}
                        size="small"
                        color="error"
                        startIcon={<RemoveCircleOutline />}
                        onClick={() => {
                          handleRemovePeer(row?.address);
                        }}
                      >
                        {t('core:action.remove', {
                          postProcess: 'capitalizeFirstChar',
                        })}
                      </Button>

                      <Button
                        disabled={isUsingGateway}
                        size="small"
                        color="success"
                        startIcon={<SyncLock />}
                        onClick={() => {
                          handleForceSync(row?.address);
                        }}
                      >
                        {t('core:action.force_sync', {
                          postProcess: 'capitalizeFirstChar',
                        })}
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                )
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>

            <TableFooter sx={{ width: '100%' }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={6}
                  count={connectedPeers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': t('core:message.generic.rows_per_page', {
                          postProcess: 'capitalizeFirstChar',
                        }),
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
        >
          {t('core:message.generic.no_peers', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Typography>
      );
    }
  };

  const tableLoaderMintingAccounts = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
            }}
          >
            {t('core:message.generic.loading_minting_accounts', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Typography>
        </div>
      </Box>
    );
  };

  const addMintingAccountDialog = () => {
    return (
      <DialogGeneral
        maxWidth="md"
        aria-labelledby="add-minting-account"
        open={openMintingAccountDialog}
        keepMounted={false}
      >
        <DialogTitle>
          {t('core:action.add_minting_account', {
            postProcess: 'capitalizeFirstChar',
          })}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t('core:message.generic.add_minting_account', {
              postProcess: 'capitalizeFirstChar',
            })}
          </DialogContentText>
          <TextField
            required
            label={t('core:message.generic.minting_key', {
              postProcess: 'capitalizeFirstChar',
            })}
            id="minting-key"
            margin="normal"
            value={mintingAccountKey}
            helperText={t('core:message.generic.minting_key_helper', {
              postProcess: 'capitalizeFirstChar',
            })}
            slotProps={{ htmlInput: { maxLength: 44, minLength: 44 } }}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setMintingAccountKey(e.target.value)
            }
          />
        </DialogContent>

        <DialogActions>
          <Button color="error" onClick={handleCloseAddMintingAccountDialog}>
            {t('core:action.cancel', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
          <Button
            color="success"
            onClick={() => {
              handleAddMintingAccount(mintingAccountKey);
            }}
          >
            {t('core:action.add', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
        </DialogActions>
      </DialogGeneral>
    );
  };

  const addPeerDialog = () => {
    return (
      <DialogGeneral
        maxWidth="md"
        aria-labelledby="add-peer"
        open={openPeerDialog}
        keepMounted={false}
      >
        <DialogTitle>
          {t('core:action.add_peer', {
            postProcess: 'capitalizeFirstChar',
          })}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t('core:message.generic.add_peer', {
              postProcess: 'capitalizeFirstChar',
            })}
          </DialogContentText>
          <TextField
            required
            label="PEER ADDRESS"
            id="peer-address"
            margin="normal"
            value={newPeerAddress}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setNewPeerAddress(e.target.value)
            }
          />
        </DialogContent>

        <DialogActions>
          <Button color="error" onClick={handleCloseAddPeerDialog}>
            {t('core:action.cancel', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
          <Button
            color="success"
            onClick={() => {
              handleAddPeer(newPeerAddress);
            }}
          >
            {t('core:action.add', {
              postProcess: 'capitalizeFirstChar',
            })}
          </Button>
        </DialogActions>
      </DialogGeneral>
    );
  };

  return (
    <Container maxWidth="xl">
      {addMintingAccountDialog()}
      {addPeerDialog()}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={successSnackbar}
        autoHideDuration={4000}
        slots={{ transition: SlideTransition }}
        onClose={handleCloseSuccessSnackbar}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: '100%', color: theme.palette.primary.main }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={errorSnackbar}
        autoHideDuration={4000}
        slots={{ transition: SlideTransition }}
        onClose={handleCloseErrorSnackbar}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: '100%', color: theme.palette.primary.main }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <AppBar position="static" sx={{ marginTop: '10px' }}>
        <Toolbar>
          <Avatar sx={{ width: 28, height: 28 }} alt="avatar" src={appLogo} />
          <Typography
            variant="h4"
            component="div"
            noWrap
            sx={{
              flexGrow: 1,
              display: {
                xs: 'none',
                sm: 'block',
                paddingLeft: '10px',
                paddingTop: '3px',
              },
              fontFamily: 'Inter',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <span style={{ color: '#05a2e4' }}>Qortal </span>Node
          </Typography>

          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{
              flexGrow: 1,
              display: {
                xs: 'block',
                sm: 'none',
                paddingLeft: '10px',
                paddingTop: '3px',
              },
              fontFamily: 'Inter',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <span style={{ color: '#05a2e4' }}>Q</span>NC
          </Typography>
          {isUsingGateway ? '' : nodeButtons()}
        </Toolbar>
      </AppBar>

      <Grid
        container
        spacing={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        sx={{ mt: 4, justifyContent: 'center', alignItems: 'baseline' }}
        columns={{ xs: 2, sm: 4, md: 6, lg: 8, xl: 12 }}
      >
        <div>
          <NodeWidget
            icon={GridView}
            title={t('core:widgets.block_height', {
              postProcess: 'capitalizeAll',
            })}
            subtitle={nodeData?.height}
          />
        </div>

        <div>
          <NodeWidget
            icon={Hub}
            title={t('core:widgets.connected_peers', {
              postProcess: 'capitalizeAll',
            })}
            subtitle={nodeData?.numberOfConnections}
          />
        </div>

        <div>
          <NodeWidget
            icon={HistoryToggleOff}
            title={t('core:widgets.node_uptime', {
              postProcess: 'capitalizeAll',
            })}
            subtitle={secondsToDhms(nodeData?.uptime / 1000)}
          />
        </div>

        <div>
          <NodeWidget
            icon={AltRoute}
            title={t('core:widgets.core_version', {
              postProcess: 'capitalizeAll',
            })}
            subtitle={nodeData?.buildVersion.replace('qortal-', 'v')}
          />
        </div>

        <div>
          <NodeWidget
            icon={Engineering}
            title={t('core:widgets.minting_status', {
              postProcess: 'capitalizeAll',
            })}
            subtitle={
              nodeData?.isMintingPossible ? (
                <span style={{ color: '#66bb6a' }}>
                  {t('core:status.minting', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </span>
              ) : (
                <span style={{ color: '#f44336' }}>
                  {t('core:status.not_minting', {
                    postProcess: 'capitalizeFirstChar',
                  })}
                </span>
              )
            }
          />
        </div>

        <div>
          <NodeWidget
            icon={Sync}
            title={t('core:widgets.sync_status', {
              postProcess: 'capitalizeAll',
            })}
            subtitle={
              nodeData?.isSynchronizing ? (
                <>
                  <span style={{ color: '#ffa726' }}>
                    {t('core:status.synchronizing', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </span>
                  <span>{'(' + nodeData?.syncPercent + '%)'}</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#66bb6a' }}>
                    {t('core:status.synchronized', {
                      postProcess: 'capitalizeFirstChar',
                    })}
                  </span>
                  <span>{'(' + nodeData?.syncPercent + '%)'}</span>
                </>
              )
            }
          />
        </div>
      </Grid>

      <Box maxWidth="xl" marginTop={3}>
        {mintingAccountsHeader()}
      </Box>

      <Divider sx={{ marginTop: '5px' }} />

      <Box maxWidth="xl" marginTop={2}>
        {loadingMintingAccountsTable
          ? tableLoaderMintingAccounts()
          : tableMintingAccounts()}
      </Box>

      <Box maxWidth="xl" marginTop={4}>
        {connectedPeersHeader()}
      </Box>

      <Divider sx={{ marginTop: '5px' }} />

      <Box maxWidth="xl" marginTop={2}>
        {tableConnectedPeers()}
      </Box>
    </Container>
  );
}

export default App;
