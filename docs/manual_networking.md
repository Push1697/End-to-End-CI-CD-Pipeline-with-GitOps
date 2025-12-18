# Manual Networking Setup (VPC & Security Groups)

If you prefer to set up the network manually instead of using Terraform, follow these steps.

## 1. Create a VPC

1. **VPC Dashboard** -> **Create VPC**.
2. **Name**: `devops-project-vpc`.
3. **IPv4 CIDR**: `10.0.0.0/16`.
4. **Create**.

## 2. Create Subnets

You need at least one public subnet for internet access.

1. **Subnets** -> **Create Subnet**.
2. **VPC**: Select `devops-project-vpc`.
3. **Name**: `public-subnet-1`.
4. **IPv4 CIDR**: `10.0.1.0/24`.
5. **Availability Zone**: `us-east-1a` (or your region).
6. **Create**.

## 3. Internet Gateway (IGW)

1. **Internet Gateways** -> **Create internet gateway**.
2. **Name**: `devops-igw`.
3. **Attach to VPC**: Select `devops-project-vpc`.

## 4. Route Table

1. **Route Tables** -> **Create route table** (or edit the main one).
2. **Name**: `public-rt`.
3. **Edit routes** -> **Add route**:
    - **Destination**: `0.0.0.0/0`
    - **Target**: `Internet Gateway` -> `devops-igw`.
4. **Subnet associations** -> **Edit subnet associations**:
    - Select `public-subnet-1` -> **Save**.

## 5. Security Groups

Create a security group for your K8s nodes.

1. **Security Groups** -> **Create security group**.
2. **Name**: `k8s-sg`.
3. **VPC**: `devops-project-vpc`.
4. **Inbound Rules**:
    - **SSH**: Port 22, Source: `My IP`.
    - **HTTPS**: Port 443, Source: `0.0.0.0/0`.
    - **Custom TCP**: Port 6443 (API Server), Source: `0.0.0.0/0` (or restricted).
    - **Custom TCP**: Port 30000-32767 (NodePorts), Source: `0.0.0.0/0`.
    - **All Traffic**: Source: `k8s-sg` (Allow nodes to talk to each other).
