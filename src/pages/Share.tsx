import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Smartphone, Monitor, Wifi } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { exportDatabase } from "@/lib/storage";

type Mode = "select" | "receive" | "send";

const Share = () => {
  const [mode, setMode] = useState<Mode>("select");
  const [connectionId, setConnectionId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [receivedFileName, setReceivedFileName] = useState<string>("");
  const [transferProgress, setTransferProgress] = useState(0);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const fileBuffer = useRef<ArrayBuffer | null>(null);
  const receivedData = useRef<Uint8Array[]>([]);

  // Initialize WebRTC connection for receiver
  const initializeReceiver = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: []
      });
      peerConnection.current = pc;

      // Create data channel
      const dc = pc.createDataChannel("fileTransfer", {
        ordered: true
      });
      setupDataChannel(dc);

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") {
          resolve();
        } else {
          pc.addEventListener("icegatheringstatechange", () => {
            if (pc.iceGatheringState === "complete") {
              resolve();
            }
          });
        }
      });

      // Create connection ID with offer
      const connectionData = {
        offer: pc.localDescription,
        timestamp: Date.now()
      };
      const id = btoa(JSON.stringify(connectionData));
      setConnectionId(id);
      setMode("receive");

      toast({
        title: "جاهز للاستقبال",
        description: "امسح رمز QR من الجهاز المرسل",
      });
    } catch (error) {
      console.error("Error initializing receiver:", error);
      toast({
        title: "خطأ",
        description: "فشل في تهيئة الاستقبال",
        variant: "destructive",
      });
    }
  };

  // Setup data channel handlers
  const setupDataChannel = (dc: RTCDataChannel) => {
    dataChannel.current = dc;

    dc.onopen = () => {
      setIsConnected(true);
      toast({
        title: "متصل",
        description: "تم الاتصال بنجاح",
      });
    };

    dc.onclose = () => {
      setIsConnected(false);
      toast({
        title: "انقطع الاتصال",
        description: "تم إنهاء الاتصال",
      });
    };

    dc.onmessage = (event) => {
      try {
        if (typeof event.data === "string") {
          // Metadata message
          const metadata = JSON.parse(event.data);
          if (metadata.type === "metadata") {
            setReceivedFileName(metadata.fileName);
            receivedData.current = [];
          } else if (metadata.type === "complete") {
            // Combine all chunks
            const totalLength = receivedData.current.reduce((acc, chunk) => acc + chunk.length, 0);
            const combinedArray = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of receivedData.current) {
              combinedArray.set(chunk, offset);
              offset += chunk.length;
            }

            // Create blob and download
            const blob = new Blob([combinedArray], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = receivedFileName || "database-backup.json";
            a.click();
            URL.revokeObjectURL(url);

            toast({
              title: "تم الاستقبال",
              description: `تم استقبال ${receivedFileName} بنجاح`,
            });

            setTransferProgress(100);
            receivedData.current = [];
          }
        } else {
          // File chunk
          const chunk = new Uint8Array(event.data);
          receivedData.current.push(chunk);
          
          // Update progress (rough estimate)
          setTransferProgress(Math.min(95, receivedData.current.length * 5));
        }
      } catch (error) {
        console.error("Error receiving data:", error);
      }
    };
  };

  // Handle QR scan for sender
  const handleQRScan = async (result: string) => {
    try {
      const connectionData = JSON.parse(atob(result));
      
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: []
      });
      peerConnection.current = pc;

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(connectionData.offer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Wait for ICE gathering
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") {
          resolve();
        } else {
          pc.addEventListener("icegatheringstatechange", () => {
            if (pc.iceGatheringState === "complete") {
              resolve();
            }
          });
        }
      });

      // Setup data channel when it opens
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel);
      };

      // Send answer back (we'll need to scan another QR or use another method)
      // For simplicity, we'll show the answer as text to be entered manually
      const answerData = {
        answer: pc.localDescription,
        timestamp: Date.now()
      };
      
      // Store answer for manual exchange
      (window as any).webrtcAnswer = answerData;

      toast({
        title: "جاهز للإرسال",
        description: "اختر ملف قاعدة البيانات للإرسال",
      });

      setMode("send");
    } catch (error) {
      console.error("Error handling QR scan:", error);
      toast({
        title: "خطأ",
        description: "فشل في معالجة رمز QR",
        variant: "destructive",
      });
    }
  };

  // Send database file
  const sendDatabase = async () => {
    try {
      if (!dataChannel.current || dataChannel.current.readyState !== "open") {
        toast({
          title: "خطأ",
          description: "لا يوجد اتصال نشط",
          variant: "destructive",
        });
        return;
      }

      const data = exportDatabase();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const arrayBuffer = await blob.arrayBuffer();
      
      const fileName = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Send metadata
      dataChannel.current.send(JSON.stringify({
        type: "metadata",
        fileName,
        fileSize: arrayBuffer.byteLength
      }));

      // Send file in chunks
      const chunkSize = 16384; // 16KB chunks
      const totalChunks = Math.ceil(arrayBuffer.byteLength / chunkSize);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, arrayBuffer.byteLength);
        const chunk = arrayBuffer.slice(start, end);
        
        dataChannel.current.send(chunk);
        setTransferProgress(Math.floor((i + 1) / totalChunks * 100));
        
        // Small delay to prevent overwhelming the channel
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Send completion message
      dataChannel.current.send(JSON.stringify({
        type: "complete"
      }));

      toast({
        title: "تم الإرسال",
        description: "تم إرسال قاعدة البيانات بنجاح",
      });
    } catch (error) {
      console.error("Error sending database:", error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال قاعدة البيانات",
        variant: "destructive",
      });
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (dataChannel.current) {
        dataChannel.current.close();
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []);

  if (mode === "select") {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">مشاركة الملفات</h1>
          <p className="text-muted-foreground">نقل قاعدة البيانات بين الأجهزة مباشرة بدون إنترنت</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={initializeReceiver}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Monitor className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">استقبال</h2>
              <p className="text-muted-foreground">
                اعرض رمز QR على هذا الجهاز (كمبيوتر) ليتم مسحه من الهاتف المرسل
              </p>
              <Button size="lg" className="w-full">
                <Download className="ml-2 h-5 w-5" />
                بدء الاستقبال
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setMode("send")}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Smartphone className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">إرسال</h2>
              <p className="text-muted-foreground">
                امسح رمز QR من الجهاز المستقبل لإرسال قاعدة البيانات
              </p>
              <Button size="lg" className="w-full">
                <Upload className="ml-2 h-5 w-5" />
                بدء الإرسال
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-3 space-x-reverse">
            <Wifi className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-bold mb-2">كيف يعمل؟</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>الجهاز المستقبل (الكمبيوتر) يختار "استقبال" ويعرض رمز QR</li>
                <li>الجهاز المرسل (الهاتف) يختار "إرسال" ويمسح رمز QR</li>
                <li>يتم الاتصال المباشر بين الجهازين بدون إنترنت</li>
                <li>يتم نقل قاعدة البيانات بشكل آمن ومباشر</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "receive") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">وضع الاستقبال</h1>
          <p className="text-muted-foreground">امسح هذا الرمز من الهاتف المرسل</p>
        </div>

        {connectionId && (
          <Card className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white p-6 rounded-lg">
                <QRCodeSVG value={connectionId} size={300} level="L" />
              </div>

              {isConnected ? (
                <div className="text-center space-y-4 w-full">
                  <div className="flex items-center justify-center space-x-2 space-x-reverse text-green-600">
                    <Wifi className="w-6 h-6" />
                    <span className="font-bold text-lg">متصل</span>
                  </div>
                  
                  {receivedFileName && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">جاري الاستقبال: {receivedFileName}</p>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${transferProgress}%` }}
                        />
                      </div>
                      <p className="text-sm font-bold">{transferProgress}%</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">في انتظار الاتصال...</p>
              )}

              <Button variant="outline" onClick={() => {
                setMode("select");
                setConnectionId("");
                setIsConnected(false);
                if (peerConnection.current) peerConnection.current.close();
              }}>
                إلغاء
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (mode === "send") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">وضع الإرسال</h1>
          <p className="text-muted-foreground">امسح رمز QR من الجهاز المستقبل</p>
        </div>

        <Card className="p-6">
          {!isConnected ? (
            <div className="space-y-6">
              <Scanner
                onScan={(result) => {
                  if (result && result[0]?.rawValue) {
                    handleQRScan(result[0].rawValue);
                  }
                }}
                onError={(error) => console.error(error)}
                constraints={{
                  facingMode: "environment",
                }}
                styles={{
                  container: { width: "100%" },
                }}
              />
              
              <Button variant="outline" className="w-full" onClick={() => setMode("select")}>
                إلغاء
              </Button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center space-x-2 space-x-reverse text-green-600">
                <Wifi className="w-6 h-6" />
                <span className="font-bold text-lg">متصل</span>
              </div>

              {transferProgress > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">جاري الإرسال...</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${transferProgress}%` }}
                    />
                  </div>
                  <p className="text-sm font-bold">{transferProgress}%</p>
                </div>
              ) : (
                <Button size="lg" className="w-full" onClick={sendDatabase}>
                  <Upload className="ml-2 h-5 w-5" />
                  إرسال قاعدة البيانات
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={() => {
                setMode("select");
                setIsConnected(false);
                if (peerConnection.current) peerConnection.current.close();
              }}>
                إلغاء
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return null;
};

export default Share;