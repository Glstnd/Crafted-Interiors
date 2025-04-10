import asyncio
from contextlib import asynccontextmanager

from aiobotocore.session import get_session, AioBaseClient
from fastapi import UploadFile


class S3Client:
    def __init__(
            self,
            access_key: str,
            secret_key: str,
            endpoint_url: str,
            bucket_name: str
    ):
        self.config = {
            "aws_access_key_id": access_key,
            "aws_secret_access_key": secret_key,
            "endpoint_url": endpoint_url,
        }
        self.bucket_name = bucket_name
        self.session = get_session()

    @asynccontextmanager
    async def get_client(self) -> AioBaseClient:
        async with self.session.create_client("s3", **self.config) as client:
            yield client

    async def upload_file(
            self,
            file: UploadFile,
            object_name: str
    ):
        async with self.get_client() as client:
            file_spec = file.filename.split(".")[-1]

            await client.put_object(
                Bucket=self.bucket_name,
                Key=f"{object_name}.{file_spec}",
                Body=file.file
            )

s3_client: S3Client = S3Client(
        access_key="t5eji5whXapbf34nlTRi",
        secret_key="2E945e8aEZaylpfhh0hdK45kDDQ0wmSJ4p39o1iK",
        endpoint_url="http://127.0.0.1:9000",
        bucket_name="catalog-images"
    )
