const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'us-east-1' });
const RAW_BUCKET = 'complaint-system-raw-data-raka123';
const STRUCTURED_BUCKET = 'complaint-system-analysis-results-raka123';

async function test() {
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: RAW_BUCKET,
            Prefix: 'complaints/',
        });
        const listResponse = await s3.send(listCommand);
        const contents = listResponse.Contents || [];

        for (const item of contents) {
            if (!item.Key.endsWith('.json')) continue;
            const complaintId = item.Key.split('/').pop().replace('.json', '');
            console.log(`Checking analyzed for: ${complaintId}`);

            try {
                const getAnalyzed = new GetObjectCommand({
                    Bucket: STRUCTURED_BUCKET,
                    Key: `analyzed/${complaintId}.json`,
                });
                const analyzedResponse = await s3.send(getAnalyzed);
                console.log(`  SUCCESS: Found analyzed for ${complaintId}`);
            } catch (e) {
                console.log(`  FAILED: ${e.name} - ${e.message}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

test();
