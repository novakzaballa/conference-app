import { useEffect, useState } from 'react';
import { Button, CircularProgress, Paper, TextField }  from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import axios from 'axios';

const createData = (
    phoneNumber: string,
    connected: boolean,
    isAHuman: boolean,
  ) => {
    return { phoneNumber, connected, isAHuman };
  }

const DenseTable = ({ phoneNumbers }: { phoneNumbers: string[] }) => {
  // const rowst = [
  //   createData('+12025550101', true, true),
  //   createData('+13035550123', true, false),
  //   createData('+14155550145', true, false),
  //   createData('+12125550187', false, false),
  //   createData('+13125550199', false, true),
  // ];
  const rows = phoneNumbers.map(number => createData(number, true, false));
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" color="success" >
          <TableHead style={{ background: "#CED4D6 " }}>
            <TableRow>
              <TableCell>Phone number</TableCell>
              <TableCell align="center">Connected</TableCell>
              <TableCell align="center">Human</TableCell>
              <TableCell align="right"><p style={{marginRight:'30px'}}>Kick</p></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.phoneNumber}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.phoneNumber}
                </TableCell>
                <TableCell align="center">{row.connected ? <DoneIcon color="success" /> : <ClearIcon color="error" />}</TableCell>
                <TableCell align="center">{row.isAHuman ? <DoneIcon color="success" /> : <ClearIcon color="error" />}</TableCell>
                <TableCell align="right">
                <Button variant="contained" color="error" endIcon={<ExitToAppIcon />}>
                    Kick
                </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
const Content = () => {
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
    const [result, setResult] = useState<string>('');

    const fetchPhoneNumbers = async () => {
      try {
          const response = await axios.get('http://localhost:3001/generate-numbers');
          setPhoneNumbers(response.data);
          console.log('DEBUG: phoneNumbers:', response.data)
      } catch (error) {
          console.error('Error fetching phone numbers:', error);
      }
    };

    useEffect(() => {
        fetchPhoneNumbers();
    }, []);
    const handleStartConference = async () => {
        try {
            const response = await axios.post('http://localhost:3001/start-conference', { phoneNumbers });
            setResult(response.data.message);
        } catch (error) {
            setResult('Failed to start conference');
        }
    };
    
    const handleFinishConference = async () => {
        try {
            const response = await axios.post('http://localhost:3001/end-conference', { phoneNumbers });
            setResult(response.data.message);
        } catch (error) {
            setResult('Failed to start conference');
        }
    };
  return (
    <Paper sx={{ maxWidth: 1000, margin: 'auto', overflow: 'hidden' }}>
        <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap flexWrap="wrap" margin={1.5}>
        <TextField
            id="outlined-basic"
            label="Outlined"
            variant="outlined"
            // onChange={(e) => setPhoneNumbers(e.target.value.split(','))}
            placeholder="Enter phone numbers separated by commas"
            type='number'
            />
            {result === 'Calls initiated' && (
              <Button variant="contained" endIcon={<PersonAddIcon />}>
                Add Participant
              </Button>
            )}
            {result !== 'Calls initiated' && (
              <Button variant="contained" color="success" endIcon={<CallIcon />} onClick={handleStartConference}>
                Start conference
              </Button>
            )}
            {result === 'Calls initiated' && (
              <Button variant="contained" color="error" endIcon={<CallEndIcon />} onClick={handleFinishConference}>
                Finish
              </Button>
            )}
        </Stack>
        {result === 'Calls initiated' && (
          <DenseTable phoneNumbers={phoneNumbers || []} />
        )}
    </Paper>
  );
}

export default Content;
