import Link from 'next/link';
import Image from 'next/image';
import { Wallet, CreditCard, DollarSign, CheckCircle, AlertCircle, ArrowRight, ExternalLink, Info } from 'lucide-react';

export default function HowToDonate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">How to Donate with FundWise</h1>
          <p className="text-emerald-400 text-center text-lg mb-12">A step-by-step guide to making blockchain-powered donations</p>
          

      {/* Introduction */}
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl mb-12">
        <div className="p-8">
          <p className="text-gray-300 mb-6 leading-relaxed">
            FundWise leverages blockchain technology to create a transparent, secure, and efficient donation platform. 
            Your contributions are recorded on the blockchain, ensuring complete transparency and traceability. 
            This guide will walk you through the process of making a donation using our platform.
          </p>
          
          <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 flex items-start">
            <Info className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">
              Blockchain donations provide several advantages over traditional methods, including reduced fees, 
              increased transparency, and the ability to track exactly how your funds are being used.
            </p>
          </div>
        </div>
      </div>
      
      {/* Steps */}
      <div className="space-y-12 mb-12">
        {/* Step 1 */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="md:w-2/5 relative h-64 md:h-auto">
              <Image 
                src="/background1.jpg" 
                alt="Browse Campaigns"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-5xl font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                1
              </div>
            </div>
            
            <div className="p-6 md:p-8 md:w-3/5">
              <h2 className="text-2xl font-bold text-white mb-4">Browse Campaigns</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Start by exploring our diverse range of verified campaigns. Each campaign has been thoroughly vetted to ensure legitimacy and transparency. You can filter campaigns by category, location, or organization to find causes that align with your values.
              </p>
              <Link 
                href="/campaigns" 
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Explore campaigns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Step 2 */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="md:flex flex-row-reverse">
            <div className="md:w-2/5 relative h-64 md:h-auto">
              <Image 
                src="/background4.jpg" 
                alt="Select Amount"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-transparent" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-5xl font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                2
              </div>
            </div>
            
            <div className="p-6 md:p-8 md:w-3/5">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Donation Amount</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Once you've found a campaign you'd like to support, click the "Donate" button. You'll be prompted to enter your desired donation amount in ETH (Ethereum). You can choose from suggested amounts or enter a custom value.
              </p>
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 mb-4">
                <h3 className="text-white font-medium mb-2">Suggested Minimum Donation</h3>
                <p className="text-emerald-500 font-bold text-xl">0.01 ETH</p>
                <p className="text-gray-400 text-sm mt-1">
                  This helps ensure that the gas fees don't outweigh your donation.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step 3 */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="md:w-2/5 relative h-64 md:h-auto">
              <Image 
                src="/background7.jpg" 
                alt="Payment Method"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-5xl font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                3
              </div>
            </div>
            
            <div className="p-6 md:p-8 md:w-3/5">
              <h2 className="text-2xl font-bold text-white mb-4">Select Payment Method</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Choose your preferred payment method. We offer two options for making donations:
              </p>
              
              <div className="space-y-4">
                <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                  <div className="flex items-center mb-2">
                    <Wallet className="h-5 w-5 text-emerald-500 mr-2" />
                    <h3 className="text-white font-medium">Crypto Wallet</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Connect your Ethereum wallet (MetaMask, WalletConnect, etc.) to make a direct blockchain transaction.
                  </p>
                </div>
                
                <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                  <div className="flex items-center mb-2">
                    <CreditCard className="h-5 w-5 text-emerald-500 mr-2" />
                    <h3 className="text-white font-medium">Credit Card</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Use your credit or debit card. We'll convert your donation to ETH and process it on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step 4 */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="md:flex flex-row-reverse">
            <div className="md:w-2/5 relative h-64 md:h-auto">
              <Image 
                src="/campaign-placeholder.jpg" 
                alt="Confirm Transaction"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-transparent" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-5xl font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                4
              </div>
            </div>
            
            <div className="p-6 md:p-8 md:w-3/5">
              <h2 className="text-2xl font-bold text-white mb-4">Confirm Transaction</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Review your donation details and confirm the transaction. If you're using a crypto wallet, you'll need to approve the transaction in your wallet. The transaction will then be submitted to the Ethereum blockchain for processing.
              </p>
              
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 mb-4">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-emerald-500 mr-2" />
                  <h3 className="text-white font-medium">Important Note</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Blockchain transactions require gas fees to process. These fees go to the Ethereum network miners, not to FundWise or the campaign.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step 5 */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="md:w-2/5 relative h-64 md:h-auto">
              <Image 
                src="/background2.jpg" 
                alt="Track Donation"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-5xl font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                5
              </div>
            </div>
            
            <div className="p-6 md:p-8 md:w-3/5">
              <h2 className="text-2xl font-bold text-white mb-4">Track Your Donation</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Once your transaction is confirmed, you'll receive a confirmation with a transaction hash. You can use this hash to track your donation on the blockchain and see how the funds are being used by the campaign.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link 
                  href="/donations" 
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 flex items-center justify-center"
                >
                  View Your Donations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                
                <a 
                  href="https://etherscan.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-black/30 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/20 transition-all duration-300 flex items-center justify-center"
                >
                  Explore Etherscan
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">What cryptocurrencies do you accept?</h3>
            <p className="text-gray-300">
              Currently, we accept Ethereum (ETH) for all donations. We plan to expand to other cryptocurrencies in the future.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-2">How do I know my donation is secure?</h3>
            <p className="text-gray-300">
              All donations are processed through smart contracts on the Ethereum blockchain, ensuring security and transparency. Each transaction is immutable and can be verified on the blockchain.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Are there any fees?</h3>
            <p className="text-gray-300">
              FundWise charges a minimal 2% platform fee to maintain our services. Additionally, blockchain transactions require gas fees, which vary based on network congestion.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Can I donate anonymously?</h3>
            <p className="text-gray-300">
              Yes, you can choose to keep your identity private. However, your wallet address will still be recorded on the blockchain for transparency purposes.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-2">How can I track how my donation is used?</h3>
            <p className="text-gray-300">
              You can track your donation through our platform under "Your Donations" or directly on the blockchain using Etherscan. Campaigns are required to provide regular updates on fund usage.
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
        <p className="text-gray-300 mb-6">
          Join thousands of donors who are using blockchain technology to support causes they care about.
        </p>
        <Link 
          href="/campaigns" 
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 inline-flex items-center"
        >
          Explore Campaigns
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  </div>
</div>
  );
}
