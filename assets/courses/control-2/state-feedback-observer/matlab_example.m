A=[0 1;-2 -3]; B=[0;1]; C=[1 0];
K=place(A,B,[-2 -4]); L=place(A',C',[-8 -10])';
assert(norm(K-[6 3])<1e-8); assert(norm(L-[15;33])<1e-8);
t=(0:.005:4)'; Aa=[A -B*K;L*C A-B*K-L*C]; Ba=[8*B;8*B];
sys=ss(Aa,Ba,eye(4),zeros(4,1)); z=lsim(sys,ones(size(t)),t,[1;0;0;0]);
plot(t,z(:,1),t,z(:,3),'--');legend('actual position','estimated position');xlabel('Time [s]');grid on;
assert(norm(z(end,1:2)-z(end,3:4))<1e-6);
