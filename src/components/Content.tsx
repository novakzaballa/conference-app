import { FC, useEffect, useState } from 'react';
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
import { Call, Device } from '@twilio/voice-sdk';

const BASE_API_URL = 'http://localhost:3000/api/v1';

type RowProps = {
  phoneNumber: string,
  connected: string,
  isAHuman: boolean,
  callSid?: string,
}
const createData = (
    phoneNumber: string,
    connected: string,
    isAHuman: boolean,
    callSid?: string
  ) => {
    return { phoneNumber, connected, isAHuman, callSid } as RowProps;
  }

type DenseTableProps = {
  phoneNumbers: string[]
}
const DenseTable: FC<DenseTableProps>  = (props) => {
  const {phoneNumbers} = props;
  const [rows, setRows] = useState<RowProps[]>([]);

  useEffect(() => {
    setRows(phoneNumbers.map(number => createData(number, 'calling', false)));
  }, [phoneNumbers]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.onopen = () => {
        console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.event === 'call-status') {
        setRows(prevRows => prevRows.map(row => {
          if (row.phoneNumber === message.number) {
            return { ...row, connected: message.status, isAHuman: message.answeredBy === 'human', callSid: message.callSid };
          }
          return row;
        }));
      }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };

    return () => ws.close();
  }, []);


    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size='small' color='success' >
          <TableHead style={{ background: '#CED4D6 ' }}>
            <TableRow>
              <TableCell>Phone number</TableCell>
              <TableCell align='center'>Connected</TableCell>
              <TableCell align='center'>Human</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.phoneNumber}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {row.phoneNumber}
                </TableCell>
                <TableCell align='center'>{row.connected === 'calling' ? <CircularProgress/> : row.connected === 'in-progress' ? <DoneIcon color='success' /> : <ClearIcon color='error' />}</TableCell>
                <TableCell align='center'>{row.isAHuman ? <DoneIcon color='success' /> : <ClearIcon color='error' />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

type ContentProps = {}
  
const Content: FC<ContentProps> = () => {
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
    const [device, setDevice] = useState<Device>();
    const [call, setCall] = useState<Call>();

    const [connectionStatus, setConnectionStatus] = useState('Not connected');
    const [activeConnection, setActiveConnection] = useState(null);

    const setupDevice = async () => {
      const response = await axios.post(BASE_API_URL + '/token');
      const token = response.data.token;

      const twilioDevice = new Device(token, {
        logLevel:1,
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      });

      initiateConference(twilioDevice);
      setDevice(twilioDevice);

      twilioDevice.on('registered', () => console.log('Device registered'));
      twilioDevice.on('error', (error: Error) => console.error('Device error:', error));

      twilioDevice.on('connect', (connection: any) => {
        setConnectionStatus('Connected');
        setActiveConnection(connection);
        console.log('Connected to conference');
      });

      twilioDevice.on('disconnect', (connection: any) => {
        if (activeConnection === connection) {
          setConnectionStatus('Disconnected');
          setActiveConnection(null);
        }
        console.log('Disconnected from conference');
      });
    };

    const fetchPhoneNumbers = async () => {
      try {
          const response = await axios.get(BASE_API_URL + '/get-numbers');
          setPhoneNumbers(response.data);
      } catch (error) {
          console.error('Error fetching phone numbers:', error);
      }
    };

    useEffect(() => {
        fetchPhoneNumbers();
    }, []);
    const handleStartConference = async () => {
        try {
          if (!device) {
            await setupDevice();
          }
          initiateConference(device!);

        } catch (error) {
          console.error('Error starting conference:', error);
        }
    };

    const initiateConference = async (device: Device) => {
      const conferenceID = 'conference-' + Math.random().toString(36).substring(7);
      const call = await device?.connect({params: {conferenceID}});
      call?.on('ringing', () => setConnectionStatus('ringing'));
      setCall(call);
    }
    
    const hangupConference = () => {
      call?.disconnect();
      setConnectionStatus('disconnected');
      console.log('Hanging up incoming call');
    }
  
  return (
    <Paper sx={{ maxWidth: 1000, margin: 'auto', overflow: 'hidden' }}>
        <Stack spacing={{ xs: 1, sm: 2 }} direction='row' useFlexGap flexWrap='wrap' margin={1.5}>
          {connectionStatus === 'Calls initiated' && (
            <Button variant='contained' endIcon={<PersonAddIcon />}>
              Add Participant
            </Button>
          )}
          {connectionStatus !== 'ringing' && (
            <Button variant='contained' color='success' endIcon={<CallIcon />} onClick={handleStartConference}>
              Start calling
            </Button>
          )}
          {connectionStatus === 'ringing' && (
            <Button variant='contained' color='error' endIcon={<CallEndIcon />} onClick={hangupConference}>
              Finish
            </Button>
          )}
        </Stack>
        {/* {connectionStatus === 'ringing' && ( */}
          <DenseTable phoneNumbers={phoneNumbers} />
        {/* )} */}
    </Paper>
  );
}

export default Content;
