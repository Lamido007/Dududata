export default function handler(req, res) {
  if (req.method === "POST") {
    return res.status(200).json({
      message: "User registered",
      wallet: "Wallet created successfully"
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
