
import * as crypto from 'crypto';

export class MerkleService {

    /**
     * Compute SHA256 hash of data
     */
    hash(data: string | Buffer): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Generate Merkle Root from a list of strings (hashes)
     * Simple pairwise hashing implementation
     */
    generateMerkleRoot(leaves: string[]): string {
        if (leaves.length === 0) return '';
        if (leaves.length === 1) return leaves[0];

        // Ensure even number of leaves by duplicating the last one if odd
        if (leaves.length % 2 !== 0) {
            leaves.push(leaves[leaves.length - 1]);
        }

        const nextLevel: string[] = [];
        for (let i = 0; i < leaves.length; i += 2) {
            const left = leaves[i];
            const right = leaves[i + 1];
            const combined = this.hash(left + right); // Simple concatenation
            nextLevel.push(combined);
        }

        return this.generateMerkleRoot(nextLevel);
    }

    /**
     * Verify a leaf against a root (Stub for now)
     */
    verify(root: string, leaf: string, proof: string[]): boolean {
        // TODO: Implement full verification if needed on client side
        return true;
    }
}

export default new MerkleService();
