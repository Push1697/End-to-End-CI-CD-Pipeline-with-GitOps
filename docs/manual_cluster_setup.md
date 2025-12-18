# Manual Kubernetes Cluster Setup on AWS (The Hard Way)

This guide walks you through setting up a Kubernetes cluster manually on AWS EC2 instances using `kubeadm`. This demonstrates a deep understanding of Kubernetes components and networking.

## Prerequisites

- AWS Account
- 2 EC2 Instances (Ubuntu 22.04 LTS)
  - **Master Node**: t3.medium (2 vCPU, 4GB RAM)
  - **Worker Node**: t3.small (2 vCPU, 2GB RAM)
- Security Group allowing:
  - SSH (22)
  - Kubernetes API (6443)
  - Kubelet (10250)
  - NodePort Range (30000-32767)
  - All traffic between Master and Worker (Self-reference SG)

---

## Step 1: Prepare Both Nodes (Master & Worker)

Run the following commands on **BOTH** the Master and Worker instances.

### 1.1 Disable Swap

Kubernetes requires swap to be disabled.

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

### 1.2 Install Container Runtime (Containerd)

```bash
# Configure modules
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# Configure sysctl networking
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system

# Install Containerd
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y containerd.io

# Generate default config
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml

# Set SystemdCgroup to true (Critical for K8s 1.24+)
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd
```

### 1.3 Install Kubeadm, Kubelet, Kubectl

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

---

## Step 2: Initialize the Master Node

Run this **ONLY** on the **Master Node**.

```bash
# Initialize cluster with Calico pod network CIDR
sudo kubeadm init --pod-network-cidr=192.168.0.0/16 --control-plane-endpoint=$(curl ifconfig.me)

# Configure kubectl for regular user
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install Calico Network Plugin
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/calico.yaml
```

**Copy the `kubeadm join` command** from the output. You will need it for the worker node.

---

## Step 3: Join the Worker Node

Run this **ONLY** on the **Worker Node**.

Paste the command you copied from the Master setup:

```bash
sudo kubeadm join <MASTER_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>
```

---

## Step 4: Verify the Cluster

Back on the **Master Node**:

```bash
kubectl get nodes
```

Both nodes should show `Ready` status after a minute.

## Step 5: Setup ArgoCD (GitOps)

Now that your cluster is running, install ArgoCD:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Access ArgoCD Server (Port Forwarding for testing)
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

You are now ready to connect your git repository!
