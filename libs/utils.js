import { Connection, PublicKey, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import kp from "./keypair.json";

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = Keypair.fromSecretKey(secret);

const programID = new PublicKey("J7ZKejUKmPmYtyx839FDUCWjnKHDpmysqoZd8JgqRzmk");

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

/**
 * Establish a connection & AnchorProvider
 * @returns {AnchorProvider} provider
 */
const getProvider = () => {
  const { solana } = window;
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new AnchorProvider(
    connection,
    solana,
    opts.preflightCommitment
  );
  return provider;
};

const getProgram = async () => {
  const provider = getProvider();
  // Get metadata about your solana program
  const idl = await Program.fetchIdl(programID, provider);
  // Create a program that you can call
  return new Program(idl, programID, provider);
};

// USING SEED METHOD
// const getBaseAccount = async (publicKey) => {
//   const program = await getProgram();
//   const [base_account] = await PublicKey.findProgramAddress(
//     [utils.bytes.utf8.encode("my_seed"), publicKey.toBuffer()],
//     program.programId
//   );
//   await checkIfBaseAccountIsInitialized(program, base_account, publicKey);
//   return { program, baseAccount: base_account };
// };

// const checkIfBaseAccountIsInitialized = async (
//   program,
//   baseAccount,
//   publicKey
// ) => {
//   try {
//     const account = await program.account.baseAccount.fetch(baseAccount);
//     return !!account;
//   } catch (err) {
//     console.error(err);
//     const tx = await program.methods
//       .initialize()
//       .accounts({
//         baseAccount: baseAccount,
//         user: publicKey,
//         systemProgram: SystemProgram.programId,
//       })
//       .rpc();
//     return !!tx;
//   }
// };

export { baseAccount, getProvider, getProgram };
