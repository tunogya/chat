import ReactMarkdown from "react-markdown";

const Privacy = () => {
  return (
    <div className={'px-2 py-2 dark:text-white'}>
      <ReactMarkdown className={'markdown prose w-full break-words dark:prose-invert light'}>
        {
          `## 隐私政策
我们非常尊重您的隐私权。因此，我们已制定这份隐私政策，以向您解释我们收集、使用和存储您的个人信息的方式以及我们所保护您隐私的措施。请您仔细阅读以下条款。

### 收集的信息
我们的系统将在您使用我们的服务时**收集您的对话信息**，并将其存储在我们的服务器上。同时，我们会记录您登录、使用、修改账户信息以及操作等行为相关的技术信息，诸如设备信息、应用程序日志等。这些信息将有助于我们改进和优化我们的服务体验。

### 如何使用信息
我们将利用您提供的信息，以提供和改进我们的服务。我们**不会出售、分享或出租您的个人讯息予他人**。如您同意，我们可以将您的信息用于新服务和功能的设计及优化，以最大程度地提高您的使用体验。

### 信息保护
我们将采取必要的技术和组织措施，保护您的个人信息，防止您的信息被意外或非法的使用、更改或破坏。**我们保证您的隐私数据不会泄露**，除非必要时，因法律或监管要求而被要求公开。

### 用户删除功能
为了保护您的隐私，您可以随时点击删除您在我们服务器上存储的数据信息。我们保证您的数据信息会在您点击删除后立即被从我们的服务器中真实删除。您的数据信息默认**最多保留 365 天**，如果过期，系统会自动删除。

### 安全保障
如果用户30天内未登录系统，为了隐私安全，我们会向用户发送邮件提醒，并**删除**用户的隐私数据。该邮件将会提醒用户使用账户登录我们的系统或点击删除，以保护他们的隐私。在此期间，用户的账户信息将被保留。


### 如果您对我们的隐私政策有任何问题或疑虑，请联系我们的客户服务部门，我们将竭诚为您提供帮助。

### 本隐私政策自2023年4月11日起生效，abandon.chat 保留对本隐私政策的修改权利。`
        }
      </ReactMarkdown>
    </div>
  )
}

export default Privacy