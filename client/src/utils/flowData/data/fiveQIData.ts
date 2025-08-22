
import { QoSValues } from '@/types/nodeTypes';

// 5QI values from the 3GPP standard
export const fiveQIValues: QoSValues[] = [
  {
    value: "1",
    resourceType: "GBR",
    priority: "20",
    packetDelay: "100 ms",
    service: "Conversational Voice"
  },
  {
    value: "2",
    resourceType: "GBR",
    priority: "40",
    packetDelay: "150 ms",
    service: "Conversational Video (Live Streaming)"
  },
  {
    value: "3",
    resourceType: "GBR",
    priority: "30",
    packetDelay: "50 ms",
    service: "Real Time Gaming, V2X messages"
  },
  {
    value: "4",
    resourceType: "GBR",
    priority: "50",
    packetDelay: "300 ms",
    service: "Non-Conversational Video (Buffered Streaming)"
  },
  {
    value: "5",
    resourceType: "Non-GBR",
    priority: "10",
    packetDelay: "100 ms",
    service: "IMS Signalling"
  },
  {
    value: "6",
    resourceType: "Non-GBR", 
    priority: "60",
    packetDelay: "300 ms",
    service: "Video (Buffered Streaming), TCP-based services"
  },
  {
    value: "7",
    resourceType: "Non-GBR",
    priority: "70",
    packetDelay: "100 ms",
    service: "Voice, Video (Live Streaming), Interactive Gaming"
  },
  {
    value: "8",
    resourceType: "Non-GBR",
    priority: "80",
    packetDelay: "300 ms", 
    service: "Video (Buffered Streaming), TCP-based services"
  },
  {
    value: "9",
    resourceType: "Non-GBR",
    priority: "90",
    packetDelay: "300 ms",
    service: "Video (Buffered Streaming), TCP-based services"
  },
  {
    value: "10",
    resourceType: "Non-GBR",
    priority: "60",
    packetDelay: "300 ms",
    service: "Non-Mission Critical User Plane Push To Talk voice"
  },
  {
    value: "11",
    resourceType: "Non-GBR",
    priority: "85",
    packetDelay: "300 ms",
    service: "Low Latency/Low Loss Internet Streaming and Website Access"
  },
  {
    value: "12",
    resourceType: "Non-GBR",
    priority: "85",
    packetDelay: "300 ms",
    service: "Low Latency/Low Loss Internet Streaming and Website Access"
  },
  {
    value: "13",
    resourceType: "Non-GBR",
    priority: "65",
    packetDelay: "100 ms",
    service: "High Priority Signalling and Real-time Interactive Gaming"
  },
  {
    value: "14",
    resourceType: "Non-GBR",
    priority: "20",
    packetDelay: "100 ms",
    service: "Video (Buffered Streaming), TCP-based services (e.g. email, chat)"
  },
  {
    value: "15",
    resourceType: "GBR",
    priority: "5",
    packetDelay: "100 ms",
    service: "Mission Critical User Plane Push To Talk voice"
  },
  {
    value: "59",
    resourceType: "GBR",
    priority: "54",
    packetDelay: "50 ms",
    service: "Live Video (non-mission critical)"
  },
  {
    value: "60",
    resourceType: "GBR",
    priority: "56",
    packetDelay: "50 ms",
    service: "Live Video (non-mission critical)"
  },
  {
    value: "65",
    resourceType: "GBR",
    priority: "7",
    packetDelay: "75 ms",
    service: "Mission Critical Push To Talk voice"
  },
  {
    value: "66",
    resourceType: "GBR",
    priority: "20",
    packetDelay: "100 ms",
    service: "Non-Mission-Critical Push To Talk voice"
  },
  {
    value: "67",
    resourceType: "GBR",
    priority: "15",
    packetDelay: "100 ms",
    service: "Mission Critical Video user plane"
  },
  {
    value: "68",
    resourceType: "GBR",
    priority: "5",
    packetDelay: "30 ms",
    service: "Mission Critical Data"
  },
  {
    value: "69",
    resourceType: "Non-GBR",
    priority: "5",
    packetDelay: "60 ms",
    service: "Mission Critical delay sensitive signalling"
  },
  {
    value: "70",
    resourceType: "Non-GBR",
    priority: "5", 
    packetDelay: "200 ms",
    service: "Mission Critical Data"
  },
  {
    value: "71",
    resourceType: "Non-GBR",
    priority: "56",
    packetDelay: "150 ms",
    service: "Live Video (non-mission critical)"
  },
  {
    value: "72",
    resourceType: "Non-GBR",
    priority: "56",
    packetDelay: "300 ms",
    service: "Live Video (non-mission critical)"
  },
  {
    value: "73",
    resourceType: "Non-GBR",
    priority: "56",
    packetDelay: "500 ms",
    service: "Live Video (non-mission critical)"
  },
  {
    value: "74",
    resourceType: "Non-GBR",
    priority: "56",
    packetDelay: "500 ms",
    service: "Live Video (non-mission critical)"
  },
  {
    value: "75",
    resourceType: "GBR", 
    priority: "25",
    packetDelay: "50 ms",
    service: "V2X messages"
  },
  {
    value: "76",
    resourceType: "Non-GBR",
    priority: "25",
    packetDelay: "50 ms",
    service: "V2X messages"
  },
  {
    value: "79",
    resourceType: "Non-GBR", 
    priority: "65",
    packetDelay: "50 ms",
    service: "V2X messages"
  },
  {
    value: "80",
    resourceType: "Non-GBR",
    priority: "68",
    packetDelay: "10 ms",
    service: "Low Latency eMBB, Augmented Reality"
  },
  {
    value: "81",
    resourceType: "GBR",
    priority: "11",
    packetDelay: "5 ms",
    service: "Remote Control (e.g., for industrial automation)"
  },
  {
    value: "82",
    resourceType: "GBR",
    priority: "19",
    packetDelay: "10 ms",
    service: "Discrete Automation"
  },
  {
    value: "83",
    resourceType: "GBR",
    priority: "22",
    packetDelay: "10 ms",
    service: "Discrete Automation"
  },
  {
    value: "84",
    resourceType: "GBR",
    priority: "24",
    packetDelay: "30 ms",
    service: "Intelligent Transport Systems"
  },
  {
    value: "85",
    resourceType: "GBR",
    priority: "21",
    packetDelay: "5 ms",
    service: "Electricity Distribution High Voltage"
  },
  {
    value: "86",
    resourceType: "Non-GBR",
    priority: "18",
    packetDelay: "5 ms",
    service: "Live Uplink Streaming"
  },
  {
    value: "87",
    resourceType: "Non-GBR",
    priority: "60",
    packetDelay: "100 ms",
    service: "Discrete Automation (non-deterministic)"
  },
  {
    value: "88",
    resourceType: "Non-GBR",
    priority: "55",
    packetDelay: "100 ms",
    service: "IoT Data, Industrial Automation"
  },
  {
    value: "89",
    resourceType: "GBR",
    priority: "51",
    packetDelay: "10 ms",
    service: "Factory Monitoring (deterministic)"
  },
  {
    value: "90",
    resourceType: "GBR",
    priority: "8",
    packetDelay: "10 ms",
    service: "High Performance Motion Control"
  }
];
